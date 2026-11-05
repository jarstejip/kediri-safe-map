package id.my.kedirisafe;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Dialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Message;
import android.provider.MediaStore;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    public static final String TARGET_URL = "https://www.kedirisafe.my.id/";

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout layoutError;
    private Button btnRetry;

    // File & Camera Chooser Callback
    private ValueCallback<Uri[]> fileUploadCallback;
    private Uri cameraImageUri;

    // Geolocation Callback
    private GeolocationPermissions.Callback geoCallback;
    private String geoOrigin;

    // Active OAuth Popup Dialog
    private Dialog oauthDialog;

    // Double Back to Exit
    private long backPressedTime = 0;

    // Activity Result Launcher for File / Camera Chooser
    private final ActivityResultLauncher<Intent> fileChooserLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
                if (fileUploadCallback == null) return;
                Uri[] results = null;
                if (result.getResultCode() == RESULT_OK) {
                    if (result.getData() == null || result.getData().getData() == null) {
                        // Hasil dari Kamera
                        if (cameraImageUri != null) {
                            results = new Uri[]{ cameraImageUri };
                        }
                    } else {
                        // Hasil dari Galeri / Dokumen
                        Intent data = result.getData();
                        if (data.getData() != null) {
                            results = new Uri[]{ data.getData() };
                        } else if (data.getClipData() != null) {
                            int count = data.getClipData().getItemCount();
                            results = new Uri[count];
                            for (int i = 0; i < count; i++) {
                                results[i] = data.getClipData().getItemAt(i).getUri();
                            }
                        }
                    }
                }
                fileUploadCallback.onReceiveValue(results);
                fileUploadCallback = null;
                cameraImageUri = null;
            });

    // Activity Result Launcher for Location Permission
    private final ActivityResultLauncher<String[]> locationPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), permissions -> {
                boolean fineGranted = Boolean.TRUE.equals(permissions.get(Manifest.permission.ACCESS_FINE_LOCATION));
                boolean coarseGranted = Boolean.TRUE.equals(permissions.get(Manifest.permission.ACCESS_COARSE_LOCATION));

                if (geoCallback != null) {
                    geoCallback.invoke(geoOrigin, fineGranted || coarseGranted, false);
                    geoCallback = null;
                }

                // Jika izin diberikan, refresh posisi GPS di webView
                if ((fineGranted || coarseGranted) && webView != null) {
                    webView.evaluateJavascript("if(window.requestUserLocation) { window.requestUserLocation(); }", null);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        setupWebView();
        setupSwipeRefresh();
        setupBackNavigation();

        // Minta izin lokasi di awal agar Leaflet GPS langsung aktif secara realtime
        checkAndRequestLocationPermission();

        // Muat web aplikasi Kediri Safe Map
        loadUrl(TARGET_URL);
    }

    private void initViews() {
        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        progressBar = findViewById(R.id.progressBar);
        layoutError = findViewById(R.id.layoutError);
        btnRetry = findViewById(R.id.btnRetry);

        btnRetry.setOnClickListener(v -> {
            layoutError.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            loadUrl(TARGET_URL);
        });
    }

    private void checkAndRequestLocationPermission() {
        boolean hasFine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean hasCoarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;

        if (!hasFine && !hasCoarse) {
            locationPermissionLauncher.launch(new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
            });
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();

        // 1. Kemampuan JavaScript & Storage Modern untuk API Realtime
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        // 2. Dukungan Pop-up Window untuk Google OAuth (GIS Popup Handshake)
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        // 3. Cookie Management (Penting untuk autentikasi & session Google / API)
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        // 4. Performa & Hardware Acceleration untuk Peta Leaflet 60fps
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // 5. User-Agent standar Chrome Mobile (Hapus "; wv" agar Google tidak menolak login OAuth)
        String defaultUA = settings.getUserAgentString();
        String cleanUA = defaultUA.replace("; wv", "");
        settings.setUserAgentString(cleanUA);

        // WebChromeClient (Geolocation, File Upload / Kamera, Progress Bar, Pop-up OAuth)
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                geoOrigin = origin;
                geoCallback = callback;

                boolean hasFine = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
                boolean hasCoarse = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;

                if (hasFine || hasCoarse) {
                    callback.invoke(origin, true, false);
                } else {
                    locationPermissionLauncher.launch(new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                    });
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (fileUploadCallback != null) {
                    fileUploadCallback.onReceiveValue(null);
                }
                fileUploadCallback = filePathCallback;

                // Intent 1: Buka Kamera Langsung
                Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                File photoFile = null;
                try {
                    String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
                    String imageFileName = "KEDIRI_SAFE_" + timeStamp + "_";
                    File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
                    if (storageDir == null) storageDir = getCacheDir();
                    photoFile = File.createTempFile(imageFileName, ".jpg", storageDir);
                    cameraImageUri = FileProvider.getUriForFile(MainActivity.this, "id.my.kedirisafe.fileprovider", photoFile);
                    takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);
                    takePictureIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                } catch (Exception ex) {
                    cameraImageUri = null;
                }

                // Intent 2: Pilih Berkas dari Galeri
                Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
                contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
                contentSelectionIntent.setType("image/*");
                contentSelectionIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);

                List<Intent> intentList = new ArrayList<>();
                if (photoFile != null) {
                    intentList.add(takePictureIntent);
                }

                Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                chooserIntent.putExtra(Intent.EXTRA_TITLE, "Ambil Foto Bencana / Pilih dari Galeri");
                if (!intentList.isEmpty()) {
                    chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentList.toArray(new Intent[0]));
                }

                try {
                    fileChooserLauncher.launch(chooserIntent);
                    return true;
                } catch (ActivityNotFoundException e) {
                    fileUploadCallback = null;
                    Toast.makeText(MainActivity.this, "Tidak ada aplikasi pemilih file yang tersedia", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }

            // DUKUNGAN POP-UP GOOGLE SIGN-IN RESMI (GIS POPUP HANDSHAKE)
            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                WebView popupWebView = new WebView(MainActivity.this);
                WebSettings popupSettings = popupWebView.getSettings();
                popupSettings.setJavaScriptEnabled(true);
                popupSettings.setDomStorageEnabled(true);
                popupSettings.setSupportMultipleWindows(true);
                popupSettings.setJavaScriptCanOpenWindowsAutomatically(true);

                // Gunakan UserAgent bersih tanpa "; wv"
                popupSettings.setUserAgentString(cleanUA);

                // Pastikan Cookie tersambung
                CookieManager.getInstance().setAcceptThirdPartyCookies(popupWebView, true);

                oauthDialog = new Dialog(MainActivity.this, android.R.style.Theme_DeviceDefault_Light_NoActionBar_Fullscreen);
                oauthDialog.setContentView(popupWebView);
                if (oauthDialog.getWindow() != null) {
                    oauthDialog.getWindow().setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
                }
                oauthDialog.show();

                popupWebView.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public void onCloseWindow(WebView window) {
                        if (oauthDialog != null && oauthDialog.isShowing()) {
                            oauthDialog.dismiss();
                        }
                        window.destroy();
                    }
                });

                popupWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                        String popUrl = request.getUrl().toString();
                        // Izinkan alur Google OAuth dan domain internal di dalam pop-up
                        if (popUrl.contains("accounts.google.com") ||
                            popUrl.contains("google.com") ||
                            popUrl.contains("kedirisafe.my.id")) {
                            return false;
                        }
                        return false;
                    }

                    @Override
                    public void onPageFinished(WebView view, String url) {
                        super.onPageFinished(view, url);
                        // Jika kembali ke halaman login atau berhasil, dialog akan otomatis tertutup oleh GIS
                    }
                });

                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(popupWebView);
                resultMsg.sendToTarget();
                return true;
            }

            @Override
            public void onCloseWindow(WebView window) {
                if (oauthDialog != null && oauthDialog.isShowing()) {
                    oauthDialog.dismiss();
                }
                super.onCloseWindow(window);
            }
        });

        // WebViewClient (URL interception & error handling)
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();

                // Tel / Phone calls (Siaga 112, RS, Polsek)
                if (url.startsWith("tel:")) {
                    Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }

                // Mailto
                if (url.startsWith("mailto:")) {
                    Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }

                // WhatsApp links (wa.me)
                if (url.startsWith("https://wa.me/") || url.startsWith("whatsapp://")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (ActivityNotFoundException e) {
                        Toast.makeText(MainActivity.this, "Aplikasi WhatsApp tidak ditemukan", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }

                // Google Maps & Geo
                if (url.startsWith("geo:") || url.contains("maps.google.com") || url.contains("goo.gl/maps")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        // Fall back to webview if no maps app
                    }
                }

                // Tetap di dalam WebView untuk domain kedirisafe.my.id dan autentikasi Google
                if (url.contains("kedirisafe.my.id") ||
                    url.contains("accounts.google.com") ||
                    url.contains("google.com/accounts") ||
                    url.contains("oauth2") ||
                    url.contains("localhost") ||
                    url.contains("127.0.0.1")) {
                    return false;
                }

                // Tautan eksternal lain dibuka di browser eksternal
                try {
                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(browserIntent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                layoutError.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefresh.setRefreshing(false);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                // Hanya tampilkan layar error jika halaman utama gagal dimuat
                if (request.isForMainFrame()) {
                    swipeRefresh.setRefreshing(false);
                    webView.setVisibility(View.GONE);
                    layoutError.setVisibility(View.VISIBLE);
                }
            }
        });
    }

    private void setupSwipeRefresh() {
        swipeRefresh.setColorSchemeResources(R.color.primary, R.color.accent);
        swipeRefresh.setOnRefreshListener(() -> {
            if (webView != null) {
                webView.reload();
            } else {
                swipeRefresh.setRefreshing(false);
            }
        });
    }

    private void setupBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (oauthDialog != null && oauthDialog.isShowing()) {
                    oauthDialog.dismiss();
                    return;
                }

                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    if (backPressedTime + 2000 > System.currentTimeMillis()) {
                        finish();
                    } else {
                        Toast.makeText(MainActivity.this, getString(R.string.exit_prompt), Toast.LENGTH_SHORT).show();
                        backPressedTime = System.currentTimeMillis();
                    }
                }
            }
        });
    }

    private void loadUrl(String url) {
        if (webView != null) {
            webView.loadUrl(url);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
        }
    }

    @Override
    protected void onDestroy() {
        if (oauthDialog != null && oauthDialog.isShowing()) {
            oauthDialog.dismiss();
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
