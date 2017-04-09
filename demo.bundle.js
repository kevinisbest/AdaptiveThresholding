

function readImage(){
 
    
    function preview(input) {
 
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            
            reader.onload = function (e) {
                $('.preview').attr('src', e.target.result);
//                var KB = format_float(e.total / 1024, 2);
//                $('.size').text("檔案大小：" + KB + " KB");
            }
 
            reader.readAsDataURL(input.files[0]);
        }
        testImage.src = input;
    }
 
    $("body").on("change", ".upl", function (){
        preview(this);
        
    })
    
}
function computeAdaptiveThreshold(sourceImageData, ratio, callback) {
    var integral = buildIntegral_Gray(sourceImageData);

    var width = sourceImageData.width;
    var height = sourceImageData.height;
    var s = width >> 8; // in fact it's s/2, but since we never use s...

    var sourceData = sourceImageData.data;
    var result = createImageData(width, height);
    var resultData = result.data;
    var resultData32 = new Uint32Array(resultData.buffer);

    var x = 0,
        y = 0,
        lineIndex = 0;

    for (y = 0; y < height; y++, lineIndex += width) {
        for (x = 0; x < width; x++) {

            var value = sourceData[(lineIndex + x) << 2];
            var x1 = Math.max(x - s, 0);
            var y1 = Math.max(y - s, 0);
            var x2 = Math.min(x + s, width - 1);
            var y2 = Math.min(y + s, height - 1);
            var area = (x2 - x1 + 1) * (y2 - y1 + 1);
            var localIntegral = getIntegralAt(integral, width, x1, y1, x2, y2);
            if (value * area > localIntegral * ratio) {
                resultData32[lineIndex + x] = 0xFFFFFFFF;
            } else {
                resultData32[lineIndex + x] = 0xFF000000;
            }
        }
    }
    return result;
}

function createImageData(width, height) {
    var canvas = document.createElement('canvas');
    return canvas.getContext('2d').createImageData(width, height);
}

function buildIntegral_Gray(sourceImageData) {
    var sourceData = sourceImageData.data;
    var width = sourceImageData.width;
    var height = sourceImageData.height;
    // should it be Int64 Array ??
    // Sure for big images 
    var integral = new Int32Array(width * height)
    // ... for loop
    var x = 0,
        y = 0,
        lineIndex = 0,
        sum = 0;
    for (x = 0; x < width; x++) {
        sum += sourceData[x << 2];
        integral[x] = sum;
    }

    for (y = 1, lineIndex = width; y < height; y++, lineIndex += width) {
        sum = 0;
        for (x = 0; x < width; x++) {
            sum += sourceData[(lineIndex + x) << 2];
            integral[lineIndex + x] = integral[lineIndex - width + x] + sum;
        }
    }
    return integral;
}

function getIntegralAt(integral, width, x1, y1, x2, y2) {
    var result = integral[x2 + y2 * width];
    if (y1 > 0) {
        result -= integral[x2 + (y1 - 1) * width];
        if (x1 > 0) {
            result += integral[(x1 - 1) + (y1 - 1) * width];
        }
    }
    if (x1 > 0) {
        result -= integral[(x1 - 1) + (y2) * width];
    }
    return result;
}

var testImage64 = "data:image/jpeg;base64,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";

var image =  readImage();


var testImage = new Image();
//image.src = readImage();
testImage.src = testImage64;

document.body.appendChild(testImage);

var canvas = document.createElement('canvas');
canvas.width = testImage.width;
canvas.height = testImage.height;
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');
ctx.drawImage(testImage, 0, 0);

var testImageData = ctx.getImageData(0, 0, testImage.width, testImage.height);

var thresholdInput = document.getElementById('threshold');
thresholdInput.onchange = function () {
    updateImage();
};

function updateImage() {
    var newTh = (+thresholdInput.value) / 100;
    var thresholded = computeAdaptiveThreshold(testImageData, newTh);
    ctx.putImageData(thresholded, 0, 0);
    ctx.fillStyle = '#EE8888';
    ctx.fillText('current Threshold :' + newTh, 10, 20);
}

//  ----------------------------------
updateImage();