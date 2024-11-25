// ファイルプレビュー表示
document.getElementById('fileInput').addEventListener('change', (event) => {
  const fileInput = event.target;
  const preview = document.getElementById('preview');
  preview.innerHTML = ''; // 既存のプレビューをクリア

  if (!fileInput.files.length) {
    return;
  }

  const file = fileInput.files[0];
  if (file.type.startsWith('image/')) {
    // 画像プレビュー
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = 'Preview';
    preview.appendChild(img);
  } else {
    // 画像以外の場合はファイル名を表示
    preview.textContent = `Selected file: ${file.name}`;
  }
});

// ファイルアップロード
document.getElementById('uploadButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  const message = document.getElementById('message');
  const uploadedLink = document.getElementById('uploadedLink');
  
  if (!fileInput.files.length) {
    message.textContent = 'Please select a file.';
    return;
  }

  const file = fileInput.files[0];
  const fileName = file.name;

  try {
    // 1. Presigned URL取得用バックエンドAPIにファイル名を送信
    const response = await fetch(`http://localhost:3000/debug/upload?fileName=${encodeURIComponent(fileName)}`);
    if (!response.ok) {
      throw new Error('Failed to get Presigned URL');
    }
    const { presignedUrl } = await response.json();

    console.log(presignedUrl);

    // 2. S3にファイルをアップロード
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (uploadResponse.ok) {
      message.textContent = 'File uploaded successfully!';
      const fileUrl = presignedUrl.split('?')[0]; // クエリパラメータを除いたURLを取得
      uploadedLink.innerHTML = `<a href="${fileUrl}" target="_blank">View Uploaded File</a>`;
    } else {
      throw new Error('Failed to upload file');
    }
  } catch (error) {
    message.textContent = `Error: ${error.message}`;
    uploadedLink.innerHTML = '';
  }
});
