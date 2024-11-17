<?php
// Path to your repository
$repoPath = '';

// Secret key you configure in the GitHub webhook settings
$secret = '';

// Get the payload and signature from GitHub
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

if (!$signature) {
    http_response_code(403);
    echo "Forbidden: No signature provided.";
    exit;
}

// Verify the payload signature
$computedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
if (!hash_equals($computedSignature, $signature)) {
    http_response_code(403);
    echo "Forbidden: Signature verification failed.";
    exit;
}

// Decode the payload for additional validation (optional)
$data = json_decode($payload, true);

// Ensure the event type is "push"
$eventType = $_SERVER['HTTP_X_GITHUB_EVENT'] ?? '';
if ($eventType !== 'push') {
    http_response_code(400);
    echo "Invalid event type: Only 'push' events are supported.";
    exit;
}

// Perform the Git pull
if (is_dir($repoPath)) {
    chdir($repoPath);
    $output = shell_exec('git pull 2>&1');
    echo "<pre>$output</pre>";
} else {
    http_response_code(500);
    echo "The directory $repoPath does not exist.";
}
?>
