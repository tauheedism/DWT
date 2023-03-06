const leftDiv = document.querySelector(".left");
const images = leftDiv.querySelectorAll("img");
if (images.length > 4) {
  leftDiv.style.overflowY = "auto";
}

var DWObject;
function Dynamsoft_OnReady() {
  DWObject = Dynamsoft.DWT.GetWebTwain("dwtcontrolContainer");
}

function AcquireImage() {
  if (DWObject) {
    DWObject.SelectSourceAsync()
      .then(function () {
        return DWObject.AcquireImageAsync({
          IfDisableSourceAfterAcquire: true,
        });
      })
      .then(function () {
        return DWObject.CloseSourceAsync();
      })
      .catch(function (exp) {
        alert(exp.message);
      });
  }
}

document
  .getElementById("Scan and Save 1")
  .addEventListener("click", function () {
    var scanConfig = {
      IfShowUI: true,
      Resolution: 100,
      PixelType: EnumDWT_PixelType.TWPT_BW,
      IfFeederEnabled: false,
      IfDisableSourceAfterAcquire: true,
    };

    var saveConfig = {
      ImageType: EnumDWT_ImageType.IT_PDF,
      IfShowFileDialog: false,
      IfSaveAnnotations: false,
    };

    DWObject.SelectSource(
      function () {
        DWObject.OpenSource();
        DWObject.IfDisableSourceAfterScan = true;
        DWObject.AcquireImage(
          scanConfig,
          function () {
            DWObject.SaveAllAsPDF(
              "D:\\temp\\result.pdf",
              saveConfig,
              function () {
                console.log("Scanned images saved successfully.");
              },
              function (errorCode, errorString) {
                console.log("Failed to save scanned images: " + errorString);
              }
            );
          },
          function (errorCode, errorString) {
            console.log(
              "Failed to acquire images from the scanner: " + errorString
            );
          }
        );
      },
      function (errorCode, errorString) {
        console.log("Failed to select a scanner source: " + errorString);
      }
    );
  });

document
  .getElementById("scan-save-2-button")
  .addEventListener("click", function () {
    var saveDir = "D:\\dynam\\";

    var fileNamePrefix = "Image_";

    var fileExt = ".pdf";

    var fileIndex = 1;

    DWObject.RemoveAllImages();

    DWObject.IfShowUI = true;
    DWObject.IfFeederEnabled = true;
    DWObject.AcquireImage();

    var imgCount = DWObject.HowManyImagesInBuffer;
    for (var i = 0; i < imgCount; i++) {
      var imgName = fileNamePrefix + (fileIndex + i) + fileExt;
      var imgPath = saveDir + imgName;
      DWObject.ConvertToPDF(i, imgPath);
    }

    fileIndex += imgCount;
  });

document
  .getElementById("remove-blank-images-button")
  .addEventListener("click", function () {
    const images = document.querySelectorAll(".dynamic-web-twain-img");

    images.forEach((image) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;

      let isBlank = true;
      for (let i = 0; i < imageData.length; i += 4) {
        if (
          imageData[i + 3] !== 0 &&
          imageData[i] !== 255 &&
          imageData[i + 1] !== 255 &&
          imageData[i + 2] !== 255
        ) {
          isBlank = false;
          break;
        }
      }

      if (isBlank) {
        image.parentNode.removeChild(image);
      }
    });
  });

document
  .getElementById("remove-all-images-button")
  .addEventListener("click", function () {
    DWObject.RemoveAllImages();

    DWObject.IfShowUI = false;
    DWObject.IfShowCancelDialogWhenBarcodeOrOCR = true;
    DWObject.IfDisableSourceAfterAcquire = true;
    DWObject.IfShowFileDialog = false;
    DWObject.HTTPUploadThroughPost("/save", function () {});
  });
