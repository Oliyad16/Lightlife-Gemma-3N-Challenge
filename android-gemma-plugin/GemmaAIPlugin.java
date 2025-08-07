package com.lifelight.gemma;

import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Capacitor plugin for Gemma AI integration on Android
 * Provides offline AI inference capabilities using ONNX Runtime
 */
@CapacitorPlugin(name = "GemmaAI")
public class GemmaAIPlugin extends Plugin {
    
    private static final String TAG = "GemmaAIPlugin";
    private GemmaAIManager aiManager;
    private boolean isInitialized = false;

    @Override
    public void load() {
        super.load();
        Log.d(TAG, "GemmaAI Plugin loaded");
        aiManager = new GemmaAIManager(getContext());
    }

    /**
     * Initialize the Gemma AI model
     */
    @PluginMethod
    public void initialize(PluginCall call) {
        String modelPath = call.getString("modelPath", "models/gemma-2b-it-q4.onnx");
        String configPath = call.getString("configPath", "models/gemma-config.json");

        Log.d(TAG, "Initializing Gemma AI model: " + modelPath);

        try {
            // Initialize model on background thread
            getActivity().runOnUiThread(() -> {
                new Thread(() -> {
                    try {
                        boolean success = aiManager.initialize(modelPath, configPath);
                        
                        JSObject result = new JSObject();
                        if (success) {
                            isInitialized = true;
                            result.put("success", true);
                            result.put("message", "Gemma AI model initialized successfully");
                            Log.i(TAG, "Model initialization successful");
                        } else {
                            result.put("success", false);
                            result.put("message", "Failed to initialize Gemma AI model");
                            Log.e(TAG, "Model initialization failed");
                        }
                        
                        call.resolve(result);
                    } catch (Exception e) {
                        Log.e(TAG, "Error during model initialization", e);
                        JSObject errorResult = new JSObject();
                        errorResult.put("success", false);
                        errorResult.put("message", "Exception during initialization: " + e.getMessage());
                        call.resolve(errorResult);
                    }
                }).start();
            });
        } catch (Exception e) {
            Log.e(TAG, "Error setting up model initialization", e);
            JSObject errorResult = new JSObject();
            errorResult.put("success", false);
            errorResult.put("message", "Setup error: " + e.getMessage());
            call.resolve(errorResult);
        }
    }

    /**
     * Generate text using the Gemma model
     */
    @PluginMethod
    public void generateText(PluginCall call) {
        if (!isInitialized) {
            call.reject("Gemma AI model not initialized. Call initialize() first.");
            return;
        }

        String prompt = call.getString("prompt");
        if (prompt == null || prompt.trim().isEmpty()) {
            call.reject("Prompt is required and cannot be empty");
            return;
        }

        Integer maxTokens = call.getInt("maxTokens", 2048);
        Float temperature = call.getFloat("temperature", 0.7f);

        Log.d(TAG, "Generating text for prompt length: " + prompt.length());

        // Run inference on background thread
        new Thread(() -> {
            try {
                long startTime = System.currentTimeMillis();
                String generatedText = aiManager.generateText(prompt, maxTokens, temperature);
                long executionTime = System.currentTimeMillis() - startTime;

                JSObject result = new JSObject();
                result.put("text", generatedText);
                result.put("executionTime", executionTime);
                result.put("tokensGenerated", estimateTokenCount(generatedText));

                Log.d(TAG, "Text generation completed in " + executionTime + "ms");
                call.resolve(result);
            } catch (Exception e) {
                Log.e(TAG, "Error during text generation", e);
                call.reject("Text generation failed: " + e.getMessage());
            }
        }).start();
    }

    /**
     * Chat with the Gemma model using conversation context
     */
    @PluginMethod
    public void chat(PluginCall call) {
        if (!isInitialized) {
            call.reject("Gemma AI model not initialized. Call initialize() first.");
            return;
        }

        JSArray messagesArray = call.getArray("messages");
        if (messagesArray == null || messagesArray.length() == 0) {
            call.reject("Messages array is required and cannot be empty");
            return;
        }

        Integer maxTokens = call.getInt("maxTokens", 2048);
        Float temperature = call.getFloat("temperature", 0.7f);

        Log.d(TAG, "Processing chat with " + messagesArray.length() + " messages");

        // Run chat on background thread
        new Thread(() -> {
            try {
                // Convert messages to format expected by AI manager
                StringBuilder conversationPrompt = new StringBuilder();
                
                for (int i = 0; i < messagesArray.length(); i++) {
                    JSONObject message = messagesArray.getJSONObject(i);
                    String role = message.getString("role");
                    String content = message.getString("content");
                    
                    if ("system".equals(role)) {
                        conversationPrompt.append("System: ").append(content).append("\n\n");
                    } else if ("user".equals(role)) {
                        conversationPrompt.append("User: ").append(content).append("\n\n");
                    } else if ("assistant".equals(role)) {
                        conversationPrompt.append("Assistant: ").append(content).append("\n\n");
                    }
                }
                
                // Add assistant prompt
                conversationPrompt.append("Assistant: ");

                long startTime = System.currentTimeMillis();
                String response = aiManager.generateText(conversationPrompt.toString(), maxTokens, temperature);
                long executionTime = System.currentTimeMillis() - startTime;

                JSObject result = new JSObject();
                result.put("response", response.trim());
                result.put("executionTime", executionTime);
                result.put("tokensGenerated", estimateTokenCount(response));

                Log.d(TAG, "Chat completion completed in " + executionTime + "ms");
                call.resolve(result);
            } catch (Exception e) {
                Log.e(TAG, "Error during chat", e);
                call.reject("Chat failed: " + e.getMessage());
            }
        }).start();
    }

    /**
     * Get information about the loaded model
     */
    @PluginMethod
    public void getModelInfo(PluginCall call) {
        JSObject result = new JSObject();
        
        if (isInitialized && aiManager != null) {
            GemmaAIManager.ModelInfo info = aiManager.getModelInfo();
            result.put("modelName", info.modelName);
            result.put("version", info.version);
            result.put("isReady", info.isReady);
            result.put("memoryUsage", info.memoryUsage);
            result.put("parametersCount", info.parametersCount);
        } else {
            result.put("modelName", "Not Initialized");
            result.put("version", "N/A");
            result.put("isReady", false);
            result.put("memoryUsage", 0);
            result.put("parametersCount", "0");
        }
        
        call.resolve(result);
    }

    /**
     * Check hardware acceleration capabilities
     */
    @PluginMethod
    public void checkHardwareAcceleration(PluginCall call) {
        try {
            GemmaAIManager.HardwareInfo hwInfo = aiManager.checkHardwareAcceleration();
            
            JSObject result = new JSObject();
            result.put("available", hwInfo.available);
            result.put("type", hwInfo.type);
            result.put("deviceInfo", hwInfo.deviceInfo);
            
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error checking hardware acceleration", e);
            JSObject result = new JSObject();
            result.put("available", false);
            result.put("type", "unknown");
            result.put("deviceInfo", "Error: " + e.getMessage());
            call.resolve(result);
        }
    }

    /**
     * Get performance metrics
     */
    @PluginMethod
    public void getPerformanceMetrics(PluginCall call) {
        if (!isInitialized) {
            call.reject("Gemma AI model not initialized");
            return;
        }

        try {
            GemmaAIManager.PerformanceMetrics metrics = aiManager.getPerformanceMetrics();
            
            JSObject result = new JSObject();
            result.put("averageInferenceTime", metrics.averageInferenceTime);
            result.put("totalInferences", metrics.totalInferences);
            result.put("memoryPeak", metrics.memoryPeak);
            result.put("batteryImpact", metrics.batteryImpact);
            
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting performance metrics", e);
            call.reject("Failed to get performance metrics: " + e.getMessage());
        }
    }

    /**
     * Destroy the AI session and free resources
     */
    @PluginMethod
    public void destroySession(PluginCall call) {
        try {
            if (aiManager != null) {
                aiManager.destroy();
            }
            isInitialized = false;
            
            JSObject result = new JSObject();
            result.put("success", true);
            
            Log.d(TAG, "AI session destroyed successfully");
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error destroying AI session", e);
            JSObject result = new JSObject();
            result.put("success", false);
            call.resolve(result);
        }
    }

    /**
     * Check if model files exist and are valid
     */
    @PluginMethod
    public void checkModelFiles(PluginCall call) {
        String modelPath = call.getString("modelPath", "models/gemma-2b-it-q4.onnx");
        String configPath = call.getString("configPath", "models/gemma-config.json");

        try {
            GemmaAIManager.ModelFileInfo fileInfo = aiManager.checkModelFiles(modelPath, configPath);
            
            JSObject result = new JSObject();
            result.put("modelExists", fileInfo.modelExists);
            result.put("configExists", fileInfo.configExists);
            result.put("modelSize", fileInfo.modelSize);
            result.put("lastModified", fileInfo.lastModified);
            
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error checking model files", e);
            call.reject("Failed to check model files: " + e.getMessage());
        }
    }

    /**
     * Configure inference settings
     */
    @PluginMethod
    public void configureInference(PluginCall call) {
        if (!isInitialized) {
            call.reject("Gemma AI model not initialized");
            return;
        }

        try {
            Boolean useGPU = call.getBoolean("useGPU", true);
            Integer threadsCount = call.getInt("threadsCount", 4);
            Integer memoryLimit = call.getInt("memoryLimit", 1024); // MB
            String precisionMode = call.getString("precisionMode", "fp16");

            boolean success = aiManager.configureInference(useGPU, threadsCount, memoryLimit, precisionMode);
            
            JSObject result = new JSObject();
            result.put("success", success);
            
            JSObject appliedSettings = new JSObject();
            appliedSettings.put("useGPU", useGPU);
            appliedSettings.put("threadsCount", threadsCount);
            appliedSettings.put("memoryLimit", memoryLimit);
            appliedSettings.put("precisionMode", precisionMode);
            result.put("appliedSettings", appliedSettings);
            
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error configuring inference", e);
            call.reject("Failed to configure inference: " + e.getMessage());
        }
    }

    /**
     * Get system information
     */
    @PluginMethod
    public void getSystemInfo(PluginCall call) {
        try {
            GemmaAIManager.SystemInfo sysInfo = aiManager.getSystemInfo();
            
            JSObject result = new JSObject();
            result.put("androidVersion", sysInfo.androidVersion);
            result.put("deviceModel", sysInfo.deviceModel);
            result.put("availableMemory", sysInfo.availableMemory);
            result.put("cpuCores", sysInfo.cpuCores);
            result.put("hasGPU", sysInfo.hasGPU);
            
            JSArray supportedFeatures = new JSArray();
            for (String feature : sysInfo.supportedFeatures) {
                supportedFeatures.put(feature);
            }
            result.put("supportedFeatures", supportedFeatures);
            
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting system info", e);
            call.reject("Failed to get system info: " + e.getMessage());
        }
    }

    /**
     * Estimate token count from text (simple approximation)
     */
    private int estimateTokenCount(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        // Simple approximation: ~4 characters per token on average
        return text.length() / 4;
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (aiManager != null) {
            try {
                aiManager.destroy();
            } catch (Exception e) {
                Log.e(TAG, "Error during plugin cleanup", e);
            }
        }
        Log.d(TAG, "GemmaAI Plugin destroyed");
    }
}