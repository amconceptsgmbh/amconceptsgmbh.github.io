<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .hidden {
            display: none;
        }
 
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #f4f4f4;
        }
 
        #uploadForm {
            background: #fff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            width: 300px;
        }
 
        #uploadForm div {
            margin-bottom: 15px;
            position: relative;
        }
 
        label {
            color: #333;
            position: absolute;
            bottom: 8px;
            left: 5px;
            transition: all 0.3s ease;    
        }
 
        input[type="text"],
        input[type="email"] {
            width: 100%;
            padding: 10px 0 10px 5px;
            border: none;
            border-bottom: 1px solid #ccc;
            box-sizing: border-box;
            background-color: transparent;
        }
 
        input[type="file"] {
            display: none;
        }
 
        button[type="submit"],
        .cv-button {
            background-color: #333;
            color: white;
            border: none;
            padding: 10px;
            margin-top: 15px;
            cursor: pointer;
            display: block;
            width: 100%;
        }
 
        button[type="submit"]:hover,
        .cv-button:hover {
            background-color: #555;
        }
 
        .cv-button::before {
            content: '+';
            margin-right: 5px;
            color: #333;
            font-size: 20px;
            line-height: 20px;
            vertical-align: middle;
        }
 
        .cv-button:hover::before {
            color: white;
        }
 
        .input-not-empty {
            color: transparent;
        }
 
        #fileName {
            display: block;
            margin-top: 10px;
               font-size: 12px;
        }
 
    </style>
</head>
<body>
    <form id="uploadForm">
        <div>
            <input type="text" id="vorname" name="vorname" required placeholder=" " oninput="toggleLabelVisibility(this)">
            <label for="vorname">Vorname</label>
        </div>
        <div>
            <input type="text" id="nachname" name="nachname" required placeholder=" " oninput="toggleLabelVisibility(this)">
            <label for="nachname">Nachname</label>
        </div>
        <div>
            <input type="email" id="email" name="email" required placeholder=" " oninput="toggleLabelVisibility(this)">
            <label for="email">Email</label>
        </div>
        <div class="blockS-container">
            <button type="button" id="CVButton" class="cv-button">Lebenslauf hochladen</button>
            <span id="fileName"></span>
        </div>
        <input
            type="file"
            id="fileInput"
            class="hidden"
            accept="application/pdf"
        />
        <div>
            <button type="submit">Submit</button>
        </div>
    </form>
    <script src=https://sdk.amazonaws.com/js/aws-sdk-2.813.0.min.js></script>
    <script>
        
        function toggleLabelVisibility(input) {
            var label = input.nextElementSibling;
            if (input.value) {
                label.classList.add('input-not-empty');
            } else {
                label.classList.remove('input-not-empty');
            }
        }
 
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('#uploadForm input[type="text"], #uploadForm input[type="email"]').forEach(function(input) {
                toggleLabelVisibility(input);
            });
 
            var fileInput = document.getElementById('fileInput');
            var cvButton = document.getElementById('CVButton');
            var fileNameDisplay = document.getElementById('fileName');
            var form = document.getElementById('uploadForm');
 
            cvButton.addEventListener('click', function() {
                fileInput.click();
            });
 
            fileInput.addEventListener('change', function() {
                if (fileInput.files.length > 0) {
                    fileNameDisplay.textContent = 'Ausgewählte Datei: ' + fileInput.files[0].name;
                } else {
                    fileNameDisplay.textContent = '';
                }
            });
 
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                uploadData();
            });
                  
            async function uploadData() {
                var file = fileInput.files[0];
                if (!file) {
                    alert('Please select a file to upload');
                    return;
                }

                // Collect form data
                var vorname = document.getElementById('vorname').value;
                var nachname = document.getElementById('nachname').value;
                var email = document.getElementById('email').value;

                // Create a new file name using the original file name and user's email
                var newFileName = file.name.split('.').slice(0, -1).join('.') + '_' + email.replace(/[@.]/g, '_') + '.pdf';

                // Request pre-signed URL from your Lambda function
                try {
                    var presignedUrlResponse = await fetch('https://zfaoybvet2.execute-api.eu-central-1.amazonaws.com/prod', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            fileName: newFileName,
                            fileType: file.type
                        })
                    });

                    var presignedUrlData = await presignedUrlResponse.json();
                    var presignedUrl = presignedUrlData.presignedUrl;

                    // Upload the file to S3 using the pre-signed URL
                    var uploadResponse = await fetch(presignedUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': file.type
                        },
                        body: file
                    });

                    if (uploadResponse.ok) {
                        console.log(`File uploaded successfully to: ${presignedUrl}`);
                    } else {
                        console.error('File upload failed.');
                    }
                } catch (err) {
                    console.error('Error getting pre-signed URL or uploading file:', err);
                }
            }
        });
    </script>
    <!--<script
    src="https://static.soulmachines.com/widget-snippet-1.12.0.min.js"
    data-sm-api-key="eyJzb3VsSWQiOiJkZG5hLWFuZHJlYXMta2huLS1hc3Nlc3NtZW50IiwiYXV0aFNlcnZlciI6Imh0dHBzOi8vZGguYXouc291bG1hY2hpbmVzLmNsb3VkL2FwaS9qd3QiLCJhdXRoVG9rZW4iOiJhcGlrZXlfdjFfM2Y2MTk0MGItMzdjYS00NmJjLWJjYjYtYjVmNGI2ODZkODYyIn0="
    ></script>-->
    <!--<script>
        /**
  * add support here for all JS-based config options,
  * assigning them to the web component's HTML attributes
  */

function configureSMWidget(config) {
  const el = document.createElement('sm-widget');

  if (config.smTokenServer) {
    el.setAttribute('token-server', config.smTokenServer);
  }

  if (config.smApiKey) {
    el.setAttribute('api-key', config.smApiKey);
  }

  if (config.smProfilePicture) {
    el.setAttribute('profile-picture', config.smProfilePicture);
  }

  if (config.smGreeting) {
    el.setAttribute('greeting', config.smGreeting);
  }

  if (config.smPosition) {
    el.setAttribute('position', config.smPosition);
  }

  if (config.smLayout) {
    el.setAttribute('layout', config.smLayout);
  }

  document.body.appendChild(el);
}

function createCSSLink(fileName) {
  const link = document.createElement('link');
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = fileName;
  return link;
}

function createJsScript(fileName) {
  const script = document.createElement('script');
  script.async = false;
  script.defer = true;
  script.src = fileName;

  return script;
}

function insertIntoHead(el) {
  const parentScript = document.getElementsByTagName('script')[0];
  parentScript.parentNode.insertBefore(el, parentScript);
}

function configureSMWidget(config) {
  const el = document.createElement('sm-widget');

  // ... other configurations ...

  if (config.smApiKey) {
    el.setAttribute('api-key', config.smApiKey);
  }

  // ... rest of the function ...
}

const apiKey = "eyJzb3VsSWQiOiJkZG5hLWFuZHJlYXMta2huLS1hc3Nlc3NtZW50IiwiYXV0aFNlcnZlciI6Imh0dHBzOi8vZGguYXouc291bG1hY2hpbmVzLmNsb3VkL2FwaS9qd3QiLCJhdXRoVG9rZW4iOiJhcGlrZXlfdjFfM2Y2MTk0MGItMzdjYS00NmJjLWJjYjYtYjVmNGI2ODZkODYyIn0"; // Replace with your actual API key

(function () {
  const script = createJsScript('https://static.soulmachines.com/web-components.1.12.0.js');
  const cssLink = createCSSLink('https://static.soulmachines.com/web-components.1.12.0.css');
  const config = {
    ...document.currentScript.dataset,
    ...window.smConfig,
    smApiKey: apiKey // Include the API key in the configuration

  };

  script.onload = () => {
    //configureSMWidget(config);

    configureSMWidget(config);
    console.log('%cWidget version: 1.12.0', "color: #FFFFFF; font-size: 18px; background: #1E5B98; padding: 10px;");
    console.log('Hello World!')
  };

  window.addEventListener('DOMContentLoaded', () => {
    insertIntoHead(cssLink)
    insertIntoHead(script);
  });
})();
    </script>-->
</body>

</html>






 



