// PRESET 25 VOCABULARY ITEMS WITH UPDATED READINGS
const quizData = [
    { katakana: "マクドナルド", romaji: ["Makudonarudo"], english: ["McDonald's", "McDonalds"] },
    { katakana: "グーグル", romaji: ["Gūguru", "Guuguru", "Google"], english: ["Google"] },
    { katakana: "トイレット", romaji: ["Toiretto"], english: ["Toilet", "Restroom"] },
    { katakana: "キットカット", romaji: ["Kittokatto"], english: ["KitKat", "Kit Kat"] },
    { katakana: "ディズニーランド", romaji: ["Disunīrando", "Disuniirando"], english: ["Disneyland"] },
    { katakana: "タクシー", romaji: ["Takushī", "Takushii"], english: ["Taxi", "Cab"] },
    { katakana: "ホテル", romaji: ["Hoteru"], english: ["Hotel"] },
    { katakana: "セブン-イレブン", romaji: ["Sebun-erebun", "Sebun erebun", "Sebun-Irebun"], english: ["7-Eleven", "7 Eleven", "Seven Eleven"] },
    { katakana: "チョコレートミルク", romaji: ["Chokorēto Miruku", "Chokoreeto Miruku"], english: ["Chocolate Milk"] },
    { katakana: "バス", romaji: ["Bāsu", "Basu"], english: ["Bus"] },
    { katakana: "ビール", romaji: ["Bīru", "Biiru"], english: ["Beer"] },
    { katakana: "スターバックス", romaji: ["Sutābakkusu", "Sutaabakkusu"], english: ["Starbucks"] },
    { katakana: "カー", romaji: ["Kā", "Kaa", "Cā", "Caa"], english: ["Car"] },
    { katakana: "チョコチップクッキー", romaji: ["Choko Cippu Kukkī", "Choko Chippu Kukkii"], english: ["Chocolate Chip Cookie"  "Choco Chip Cookie"] },
    { katakana: "エアコン", romaji: ["Eakon"], english: ["Aircon", "Air Conditioner"] },
    { katakana: "キッチンセット", romaji: ["Kitchin Setto", "Kicchin Setto], english: ["Kitchen Set"] },
    { katakana: "チーズリング", romaji: ["Chīzu Ringu", "Chiizu Ringu"], english: ["Cheese Ring"] },
    { katakana: "グレープグミキャンディ", romaji: ["Gurēpu Gamī Kyandī", "Gureepu Gumi Kyandii"], english: ["Grape Gummy Candy"] },
    { katakana: "コンピューター", romaji: ["Kompyūtā", "Kompyuutaa"], english: ["Computer"] },
    { katakana: "スマートフォン", romaji: ["Sumātofōn", "Sumaatofon"], english: ["Smartphone"] },
    { katakana: "フルーツ", romaji: ["Furūtsu", "Furuutsu"], english: ["Fruit", "Fruits"] },
    { katakana: "アップル", romaji: ["Appuru"], english: ["Apple"] },
    { katakana: "オレンジ", romaji: ["Orenji"], english: ["Orange"] },
    { katakana: "ストロベリー", romaji: ["Sutoroberī", "Sutoroberii"], english: ["Strawberry"] },
    { katakana: "レインコート", romaji: ["Rein Kōto", "Rein Kooto"], english: ["Rain Coat", "Raincoat"] }
];

// STATE VARIABLES
let currentIndex = 0;
let userAnswers = [];
let quizStartTime = 0;
let totalTimeSeconds = 0;
let videoStream = null;

let studentDetails = { name: "", section: "" };

// DOM ELEMENTS
const screenIntro = document.getElementById("screen-intro");
const screenQuiz = document.getElementById("screen-quiz");
const screenResult = document.getElementById("screen-result");

const hudProgress = document.getElementById("hud-progress");
const katakanaTarget = document.getElementById("katakana-target");

const task1Box = document.getElementById("task1-box");
const task2Box = document.getElementById("task2-box");
const inputRomaji = document.getElementById("input-romaji");
const inputEnglish = document.getElementById("input-english");

const btnStart = document.getElementById("btn-start");
const btnSubmitTask1 = document.getElementById("btn-submit-task1");
const btnSubmitTask2 = document.getElementById("btn-submit-task2");

const webcamElement = document.getElementById("webcam");
const photoCanvas = document.getElementById("photo-canvas");
const btnSnap = document.getElementById("btn-snap");
const btnRetake = document.getElementById("btn-retake");

// EVENT LISTENERS
btnStart.addEventListener("click", startQuiz);
btnSubmitTask1.addEventListener("click", handleTask1);
btnSubmitTask2.addEventListener("click", handleTask2);
btnSnap.addEventListener("click", capturePhoto);
btnRetake.addEventListener("click", resetCamera);
document.getElementById("btn-download").addEventListener("click", downloadCertificate);

function startQuiz() {
    const name = document.getElementById("student-name").value.trim();
    const section = document.getElementById("student-section").value.trim();

    if (!name || !section) {
        alert("Please enter both your Name and Section before starting!");
        return;
    }

    studentDetails.name = name;
    studentDetails.section = section;
    
    currentIndex = 0;
    userAnswers = [];
    quizStartTime = Date.now();

    screenIntro.classList.remove("active");
    screenQuiz.classList.add("active");

    loadItem();
}

function loadItem() {
    hudProgress.innerText = `${currentIndex + 1} / 25`;
    katakanaTarget.innerText = quizData[currentIndex].katakana;

    inputRomaji.value = "";
    inputEnglish.value = "";

    task1Box.classList.remove("hidden");
    task2Box.classList.add("hidden");
}

function handleTask1() {
    const romajiVal = inputRomaji.value.trim();
    if (!romajiVal) {
        alert("Please enter the Romaji reading first.");
        return;
    }

    task1Box.classList.add("hidden");
    task2Box.classList.remove("hidden");
}

function handleTask2() {
    const englishVal = inputEnglish.value.trim();
    if (!englishVal) {
        alert("Please enter the English translation/label.");
        return;
    }

    // Record response without revealing correct status
    userAnswers.push({
        romajiInput: inputRomaji.value.trim(),
        englishInput: englishVal
    });

    currentIndex++;
    if (currentIndex < quizData.length) {
        loadItem();
    } else {
        finishQuiz();
    }
}

// EVALUATION LOGIC
function evaluateAnswer(input, correctList) {
    if (!input) return 0;
    
    const cleanInput = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 2.0 Points: Exact match
    for (let target of correctList) {
        let cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanInput === cleanTarget) return 2;
    }

    // 1.0 Point: Close match
    for (let target of correctList) {
        let cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanInput.includes(cleanTarget) || cleanTarget.includes(cleanInput)) return 1;
    }

    // 0.5 Points: Meaningful attempt
    if (cleanInput.length >= 2) return 0.5;

    return 0;
}

function finishQuiz() {
    totalTimeSeconds = Math.floor((Date.now() - quizStartTime) / 1000);

    screenQuiz.classList.remove("active");
    screenResult.classList.add("active");

    let totalPoints = 0;
    const tableBody = document.getElementById("results-table-body");
    tableBody.innerHTML = "";

    quizData.forEach((item, index) => {
        let userAns = userAnswers[index];
        
        let scoreRomaji = evaluateAnswer(userAns.romajiInput, item.romaji);
        let scoreEnglish = evaluateAnswer(userAns.englishInput, item.english);
        let itemScore = scoreRomaji + scoreEnglish; // Max 4 points per item
        
        totalPoints += itemScore;

        let isRomajiCorrect = scoreRomaji >= 1;
        let isEnglishCorrect = scoreEnglish >= 1;

        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.katakana}</strong></td>
            <td class="${isRomajiCorrect ? 'text-correct' : 'text-incorrect'}">${userAns.romajiInput}</td>
            <td class="${isEnglishCorrect ? 'text-correct' : 'text-incorrect'}">${userAns.englishInput}</td>
            <td class="text-corrected">${item.romaji[0]} / ${item.english[0]}</td>
            <td><strong>${itemScore} / 4 pts</strong></td>
        `;
        tableBody.appendChild(tr);
    });

    // Score scaled out of 100
    let finalPercentage = Math.round((totalPoints / (25 * 4)) * 100);

    document.getElementById("cert-name").innerText = studentDetails.name;
    document.getElementById("cert-section").innerText = `Section: ${studentDetails.section}`;
    document.getElementById("cert-score").innerText = `${finalPercentage} / 100`;

    const mins = Math.floor(totalTimeSeconds / 60).toString().padStart(2, '0');
    const secs = (totalTimeSeconds % 60).toString().padStart(2, '0');
    document.getElementById("cert-time").innerText = `${mins}:${secs}`;
    document.getElementById("cert-date").innerText = new Date().toLocaleDateString();

    initCamera();
}

function initCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoStream = stream;
                webcamElement.srcObject = stream;
                webcamElement.style.display = "block";
                photoCanvas.style.display = "none";
                btnSnap.style.display = "inline-block";
                btnRetake.style.display = "none";
            })
            .catch(err => {
                console.warn("Camera access denied or unavailable:", err);
            });
    }
}

function capturePhoto() {
    const context = photoCanvas.getContext('2d');
    context.drawImage(webcamElement, 0, 0, 320, 240);
    const photoDataUrl = photoCanvas.toDataURL('image/png');

    const certPhoto = document.getElementById("certificate-photo");
    certPhoto.style.backgroundImage = `url('${photoDataUrl}')`;

    webcamElement.style.display = "none";
    photoCanvas.style.display = "block";
    btnSnap.style.display = "none";
    btnRetake.style.display = "inline-block";
}

function resetCamera() {
    webcamElement.style.display = "block";
    photoCanvas.style.display = "none";
    btnSnap.style.display = "inline-block";
    btnRetake.style.display = "none";
}

function downloadCertificate() {
    const certElement = document.getElementById("certificate-wrapper");
    html2canvas(certElement, { scale: 2 }).then(canvas => {
        const link = document.createElement("a");
        link.download = `${studentDetails.name.replace(/\s+/g, '_')}_Katakana_Certificate.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}
