package app.zyron.fitness;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ZyronMediaPlugin.class);
        registerPlugin(ZyronVideoPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
