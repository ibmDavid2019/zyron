package app.zyron.fitness

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Base64
import androidx.annotation.OptIn
import androidx.core.content.FileProvider
import androidx.media3.common.Effect
import androidx.media3.common.MediaItem
import androidx.media3.common.audio.AudioProcessor
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.BitmapOverlay
import androidx.media3.effect.OverlayEffect
import androidx.media3.effect.TextureOverlay
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.EditedMediaItemSequence
import androidx.media3.transformer.Effects
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.ProgressHolder
import androidx.media3.transformer.Transformer
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.common.collect.ImmutableList
import java.io.ByteArrayOutputStream
import java.io.File

/**
 * Second hand-written native plugin — burns the same stat/route overlay
 * used for photo sharing onto a real video clip, keeping the video playing
 * (never converted to a static image). Built on AndroidX Media3
 * `Transformer`, which sits on top of `MediaCodec` and ships overlay +
 * trim support out of the box — chosen over FFmpegKit (archived/
 * discontinued upstream in Jan 2025) and over hand-rolled raw MediaCodec
 * (too much risk for this project's first video-processing code).
 *
 * The overlay itself is a single PNG (with transparency) that the JS side
 * pre-renders once via the same canvas layout code used for photo
 * sharing — it doesn't change frame to frame, so one static bitmap applied
 * for the whole clip via BitmapOverlay is enough; no per-frame redraw.
 *
 * See lib/native-video-plugin.ts for the JS-side contract.
 */
@OptIn(UnstableApi::class)
@CapacitorPlugin(name = "ZyronVideo")
class ZyronVideoPlugin : Plugin() {

    private val mainHandler = Handler(Looper.getMainLooper())
    private var transformer: Transformer? = null
    private var progressRunnable: Runnable? = null

    private val fileProviderAuthority: String
        get() = "${context.packageName}.fileprovider"

    @PluginMethod
    fun isSupported(call: PluginCall) {
        val result = JSObject()
        // Media3 Transformer's overlay/effect pipeline needs a real GPU (GLES)
        // path, reliably available from Android 7 (API 24) onward — below
        // that, fall back to photo-only sharing rather than risk a silent
        // failure on old devices (this project's minSdk is 23).
        result.put("supported", Build.VERSION.SDK_INT >= Build.VERSION_CODES.N)
        call.resolve(result)
    }

    @PluginMethod
    fun compositeVideo(call: PluginCall) {
        val videoUriString = call.getString("videoUri")
        val overlayBase64 = call.getString("overlayBase64")
        val outputFileName = call.getString("outputFileName") ?: "zyron-share.mp4"
        val trimStartMs = (call.getInt("trimStartMs", 0) ?: 0).toLong()
        val trimEndMsRaw = call.getInt("trimEndMs", -1) ?: -1

        if (videoUriString == null || overlayBase64 == null) {
            call.reject("videoUri and overlayBase64 are required")
            return
        }

        val overlayBytes = Base64.decode(overlayBase64, Base64.DEFAULT)
        val overlayBitmap = BitmapFactory.decodeByteArray(overlayBytes, 0, overlayBytes.size)
        if (overlayBitmap == null) {
            call.reject("Could not decode overlayBase64 as a bitmap")
            return
        }

        val outDir = File(context.cacheDir, "composited")
        if (!outDir.exists()) outDir.mkdirs()
        val outputFile = File(outDir, outputFileName)
        if (outputFile.exists()) outputFile.delete()

        mainHandler.post {
            try {
                startComposite(call, Uri.parse(videoUriString), overlayBitmap, trimStartMs, trimEndMsRaw, outputFile)
            } catch (error: Exception) {
                call.reject("Failed to start video composite: ${error.message}", error)
            }
        }
    }

    private fun startComposite(
        call: PluginCall,
        videoUri: Uri,
        overlayBitmap: Bitmap,
        trimStartMs: Long,
        trimEndMsRaw: Int,
        outputFile: File
    ) {
        val itemBuilder = MediaItem.Builder().setUri(videoUri)
        if (trimStartMs > 0 || trimEndMsRaw > 0) {
            val clipBuilder = MediaItem.ClippingConfiguration.Builder().setStartPositionMs(trimStartMs)
            if (trimEndMsRaw > 0) clipBuilder.setEndPositionMs(trimEndMsRaw.toLong())
            itemBuilder.setClippingConfiguration(clipBuilder.build())
        }
        val mediaItem = itemBuilder.build()

        val overlay: TextureOverlay = object : BitmapOverlay() {
            override fun getBitmap(presentationTimeUs: Long): Bitmap = overlayBitmap
        }
        val overlayEffect = OverlayEffect(ImmutableList.of<TextureOverlay>(overlay))

        val editedMediaItem = EditedMediaItem.Builder(mediaItem)
            .setEffects(Effects(ImmutableList.of<AudioProcessor>(), ImmutableList.of<Effect>(overlayEffect)))
            .build()

        val sequence = EditedMediaItemSequence.Builder(editedMediaItem).build()
        val composition = Composition.Builder(sequence).build()

        val newTransformer = Transformer.Builder(context)
            .addListener(
                object : Transformer.Listener {
                    override fun onCompleted(composition: Composition, exportResult: ExportResult) {
                        stopProgressPolling()
                        onCompositeCompleted(call, outputFile)
                    }

                    override fun onError(
                        composition: Composition,
                        exportResult: ExportResult,
                        exportException: ExportException
                    ) {
                        stopProgressPolling()
                        call.reject("Video export failed: ${exportException.message}", exportException)
                    }
                }
            )
            .build()

        transformer = newTransformer
        newTransformer.start(composition, outputFile.absolutePath)
        startProgressPolling(newTransformer)
    }

    private fun startProgressPolling(activeTransformer: Transformer) {
        val holder = ProgressHolder()
        val runnable = object : Runnable {
            override fun run() {
                val state = activeTransformer.getProgress(holder)
                if (state != Transformer.PROGRESS_STATE_NOT_STARTED) {
                    val event = JSObject()
                    event.put("percent", holder.progress)
                    notifyListeners("compositeProgress", event)
                }
                mainHandler.postDelayed(this, 300)
            }
        }
        progressRunnable = runnable
        mainHandler.post(runnable)
    }

    private fun stopProgressPolling() {
        progressRunnable?.let { mainHandler.removeCallbacks(it) }
        progressRunnable = null
    }

    private fun onCompositeCompleted(call: PluginCall, outputFile: File) {
        try {
            val outputUri = FileProvider.getUriForFile(context, fileProviderAuthority, outputFile)

            var thumbnailBase64: String? = null
            try {
                val retriever = MediaMetadataRetriever()
                retriever.setDataSource(outputFile.absolutePath)
                val frame = retriever.getFrameAtTime(0)
                retriever.release()
                if (frame != null) {
                    val stream = ByteArrayOutputStream()
                    frame.compress(Bitmap.CompressFormat.JPEG, 80, stream)
                    thumbnailBase64 = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
                }
            } catch (thumbnailError: Exception) {
                // Non-fatal — the caller still gets the real video, just without a preview frame.
            }

            val result = JSObject()
            result.put("contentUri", outputUri.toString())
            if (thumbnailBase64 != null) result.put("thumbnailBase64", thumbnailBase64)
            call.resolve(result)
        } catch (error: Exception) {
            call.reject("Failed to finalize video: ${error.message}", error)
        }
    }
}
