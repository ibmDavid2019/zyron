package app.zyron.fitness

import android.content.ActivityNotFoundException
import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import androidx.activity.result.ActivityResult
import androidx.core.content.FileProvider
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.File
import java.io.FileOutputStream

/**
 * First hand-written native Capacitor plugin in this project. Backs the
 * activity-sharing feature's "Compartilhar" (per-app Android share intents,
 * with automatic fallback to the system chooser) and "Salvar no
 * dispositivo" (real MediaStore gallery save) actions — see
 * lib/native-media-plugin.ts for the JS-side contract this implements.
 *
 * Never exposes a raw file path to JS or to another app: every URI handed
 * out comes from the FileProvider already declared in AndroidManifest.xml
 * (authority "${applicationId}.fileprovider"), matching
 * res/xml/file_paths.xml's "zyron_share_cache" entry.
 */
@CapacitorPlugin(name = "ZyronMedia")
class ZyronMediaPlugin : Plugin() {

    private val fileProviderAuthority: String
        get() = "${context.packageName}.fileprovider"

    @PluginMethod
    fun writeMedia(call: PluginCall) {
        val base64 = call.getString("base64")
        val fileName = call.getString("fileName")
        val mimeType = call.getString("mimeType") ?: "application/octet-stream"

        if (base64 == null || fileName == null) {
            call.reject("base64 and fileName are required")
            return
        }

        try {
            val shareDir = File(context.cacheDir, "share")
            if (!shareDir.exists()) shareDir.mkdirs()
            val outFile = File(shareDir, fileName)

            val bytes = Base64.decode(base64, Base64.DEFAULT)
            FileOutputStream(outFile).use { it.write(bytes) }

            val uri: Uri = FileProvider.getUriForFile(context, fileProviderAuthority, outFile)
            val result = JSObject()
            result.put("contentUri", uri.toString())
            call.resolve(result)
        } catch (error: Exception) {
            call.reject("Failed to write media: ${error.message}", error)
        }
    }

    @PluginMethod
    fun shareMedia(call: PluginCall) {
        val contentUriString = call.getString("contentUri")
        val mimeType = call.getString("mimeType")
        val text = call.getString("text")
        val targetPackage = call.getString("targetPackage")

        if (contentUriString == null || mimeType == null) {
            call.reject("contentUri and mimeType are required")
            return
        }

        val uri = Uri.parse(contentUriString)

        fun buildIntent(pkg: String?): Intent {
            val intent = Intent(Intent.ACTION_SEND)
            intent.type = mimeType
            intent.putExtra(Intent.EXTRA_STREAM, uri)
            if (!text.isNullOrEmpty()) intent.putExtra(Intent.EXTRA_TEXT, text)
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (pkg != null) intent.setPackage(pkg)
            return intent
        }

        try {
            if (targetPackage != null) {
                try {
                    activity.startActivity(buildIntent(targetPackage))
                    val result = JSObject()
                    result.put("opened", true)
                    call.resolve(result)
                    return
                } catch (notInstalled: ActivityNotFoundException) {
                    // Targeted app isn't installed — fall through to the generic chooser below.
                }
            }

            val chooser = Intent.createChooser(buildIntent(null), "Compartilhar atividade")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            activity.startActivity(chooser)
            val result = JSObject()
            result.put("opened", true)
            call.resolve(result)
        } catch (error: Exception) {
            call.reject("Failed to open share sheet: ${error.message}", error)
        }
    }

    @PluginMethod
    fun saveToGallery(call: PluginCall) {
        val contentUriString = call.getString("contentUri")
        val kind = call.getString("kind")

        if (contentUriString == null || kind == null) {
            call.reject("contentUri and kind are required")
            return
        }

        try {
            val sourceUri = Uri.parse(contentUriString)
            val isVideo = kind == "video"
            val fileName = "ZYRON_${System.currentTimeMillis()}.${if (isVideo) "mp4" else "png"}"

            val collection = if (isVideo) {
                MediaStore.Video.Media.EXTERNAL_CONTENT_URI
            } else {
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI
            }

            val values = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, if (isVideo) "video/mp4" else "image/png")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    put(
                        MediaStore.MediaColumns.RELATIVE_PATH,
                        (if (isVideo) Environment.DIRECTORY_MOVIES else Environment.DIRECTORY_PICTURES) + "/ZYRON"
                    )
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }
            }

            val resolver = context.contentResolver
            val destUri = resolver.insert(collection, values)
                ?: throw IllegalStateException("MediaStore.insert returned null")

            resolver.openOutputStream(destUri)?.use { out ->
                resolver.openInputStream(sourceUri)?.use { input -> input.copyTo(out) }
                    ?: throw IllegalStateException("Could not open source content URI")
            } ?: throw IllegalStateException("Could not open MediaStore output stream")

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                values.clear()
                values.put(MediaStore.MediaColumns.IS_PENDING, 0)
                resolver.update(destUri, values, null, null)
            }

            val result = JSObject()
            result.put("savedUri", destUri.toString())
            call.resolve(result)
        } catch (error: Exception) {
            call.reject("Failed to save to gallery: ${error.message}", error)
        }
    }

    /**
     * Opens the system video picker. Uses ACTION_GET_CONTENT (not the newer
     * Android 13+ Photo Picker) specifically because it works unchanged
     * across this app's whole supported range (minSdk 23) — no separate
     * fallback path to maintain for older devices, and no runtime
     * permission either way, since the system handles the picker itself.
     */
    @PluginMethod
    fun pickVideo(call: PluginCall) {
        try {
            val intent = Intent(Intent.ACTION_GET_CONTENT)
            intent.type = "video/*"
            intent.addCategory(Intent.CATEGORY_OPENABLE)
            startActivityForResult(call, intent, "onPickVideoResult")
        } catch (error: Exception) {
            call.reject("Failed to open video picker: ${error.message}", error)
        }
    }

    @ActivityCallback
    private fun onPickVideoResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        val uri = result.data?.data
        if (result.resultCode != android.app.Activity.RESULT_OK || uri == null) {
            call.reject("cancelled")
            return
        }
        try {
            context.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
        } catch (ignored: SecurityException) {
            // Some providers don't support persistable permissions — the URI is still readable for this session.
        }
        val response = JSObject()
        response.put("videoUri", uri.toString())
        call.resolve(response)
    }

    /** Launches the system camera app to record a video, saved straight into a FileProvider-backed cache file. */
    @PluginMethod
    fun captureVideo(call: PluginCall) {
        try {
            val captureDir = File(context.cacheDir, "share")
            if (!captureDir.exists()) captureDir.mkdirs()
            val outFile = File(captureDir, "capture-${System.currentTimeMillis()}.mp4")
            val outUri = FileProvider.getUriForFile(context, fileProviderAuthority, outFile)

            val intent = Intent(MediaStore.ACTION_VIDEO_CAPTURE)
            intent.putExtra(MediaStore.EXTRA_OUTPUT, outUri)
            intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)

            call.data.apply {
                put("__outputPath", outFile.absolutePath)
                put("__outputUri", outUri.toString())
            }
            startActivityForResult(call, intent, "onCaptureVideoResult")
        } catch (error: Exception) {
            call.reject("Failed to open camera: ${error.message}", error)
        }
    }

    @ActivityCallback
    private fun onCaptureVideoResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        if (result.resultCode != android.app.Activity.RESULT_OK) {
            call.reject("cancelled")
            return
        }
        val outputPath = call.getString("__outputPath")
        val outputUriString = call.getString("__outputUri")
        if (outputPath == null || outputUriString == null || !File(outputPath).exists()) {
            call.reject("Recording did not produce an output file")
            return
        }
        val response = JSObject()
        response.put("videoUri", outputUriString)
        call.resolve(response)
    }
}
