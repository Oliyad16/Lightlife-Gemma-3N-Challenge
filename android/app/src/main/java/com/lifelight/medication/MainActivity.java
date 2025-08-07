package com.lifelight.medication;

import android.os.Bundle;
import android.util.Log;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;
import com.lifelight.gemma.GemmaAIPlugin;

/**
 * Main activity for LifeLight Gemma 3N medication management app
 * Integrates with Capacitor bridge for web-native communication
 */
public class MainActivity extends BridgeActivity {

    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.d(TAG, "LifeLight Gemma 3N MainActivity created");

        // Register custom plugins
        registerPlugin(GemmaAIPlugin.class);
        Log.d(TAG, "GemmaAI plugin registered");

        // Configure window for elderly-friendly display
        configureWindow();

        // Initialize app components
        initializeApp();
    }

    /**
     * Configure window settings for elderly-friendly interface
     */
    private void configureWindow() {
        try {
            // Keep screen on during medication management
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            
            // Set brightness to maximum for better visibility
            WindowManager.LayoutParams layoutParams = getWindow().getAttributes();
            layoutParams.screenBrightness = 1.0f;
            getWindow().setAttributes(layoutParams);
            
            Log.d(TAG, "Window configured for elderly-friendly display");
        } catch (Exception e) {
            Log.e(TAG, "Error configuring window", e);
        }
    }

    /**
     * Initialize app-specific components
     */
    private void initializeApp() {
        try {
            // Pre-warm AI model in background
            new Thread(() -> {
                try {
                    Log.d(TAG, "Pre-warming AI model...");
                    // This will be handled by the GemmaAIPlugin when initialized
                    Thread.sleep(100); // Small delay to let the app fully load
                    Log.d(TAG, "AI model pre-warming initiated");
                } catch (InterruptedException e) {
                    Log.w(TAG, "AI model pre-warming interrupted", e);
                }
            }).start();

            Log.d(TAG, "App initialization completed");
        } catch (Exception e) {
            Log.e(TAG, "Error during app initialization", e);
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        Log.d(TAG, "MainActivity started");
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "MainActivity resumed");
    }

    @Override
    public void onPause() {
        super.onPause();
        Log.d(TAG, "MainActivity paused");
    }

    @Override
    public void onStop() {
        super.onStop();
        Log.d(TAG, "MainActivity stopped");
    }

    @Override
    public void onDestroy() {
        try {
            // Clean up resources
            Log.d(TAG, "MainActivity destroying - cleaning up resources");
        } catch (Exception e) {
            Log.e(TAG, "Error during cleanup", e);
        } finally {
            super.onDestroy();
        }
    }

    @Override
    public void onBackPressed() {
        // Handle back button for elderly users - require confirmation
        try {
            // This will be handled by the JavaScript layer for consistent UX
            super.onBackPressed();
        } catch (Exception e) {
            Log.e(TAG, "Error handling back press", e);
        }
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        Log.w(TAG, "Low memory warning - consider freeing AI model resources");
        
        // Optionally trigger memory cleanup in AI plugin
        try {
            // Could notify the web layer to free non-essential resources
            getBridge().getWebView().evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('low-memory-warning'))", 
                null
            );
        } catch (Exception e) {
            Log.e(TAG, "Error handling low memory", e);
        }
    }
}