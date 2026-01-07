document.addEventListener("DOMContentLoaded", () => {
    // --- 1. AMBIL ELEMEN DARI HTML ---
    const landingView = document.getElementById("landing-view");
    const playerView = document.getElementById("player-view");
    const startBtn = document.getElementById("startExperienceBtn");
    const backBtn = document.getElementById("backToHomeBtn");
    
    const player = document.getElementById("player");
    const overlay = document.getElementById("overlay");
    const modalPrompt = document.getElementById("modalPrompt");
    const modalButtons = document.getElementById("modalButtons");
    const sceneLabel = document.getElementById("sceneLabel");
    const pathLabel = document.getElementById("pathLabel");
    const fsBtn = document.getElementById("fsBtn");
    const restartBtn = document.getElementById("restartBtn");
    const stage = document.getElementById("stage");

    // --- 2. DATA VIDEO & ALUR CERITA ---
    // PENTING: Ganti link 'src' di bawah ini dengan nama file videomu sendiri nanti.
    // Contoh: src: "videos/intro.mp4"
    const SCENES = {
        intro: {
            label: "INTRO",
            src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", 
            choiceAt: 4, // Detik ke berapa pilihan muncul
            prompt: "Kamu mendengar suara aneh dari balik pintu...",
            choices: [
                { text: "BUKA PINTU", to: "sceneA", tag: "BUKA" },
                { text: "ABAIKAN", to: "sceneB", tag: "PERGI" }
            ]
        },
        sceneA: {
            label: "RUANG 304",
            src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
            choiceAt: 5,
            prompt: "Ada sosok berdiri di pojok ruangan!",
            choices: [
                { text: "DEKATI", to: "end1", tag: "BERANI" },
                { text: "LARI", to: "end2", tag: "TAKUT" }
            ]
        },
        sceneB: {
            label: "KORIDOR GELAP",
            src: "http://media.w3.org/2010/05/sintel/trailer.mp4",
            choiceAt: 10,
            prompt: "Langkah kaki mendekatimu dari belakang...",
            choices: [
                { text: "SEMBUNYI", to: "end1", tag: "SEMBUNYI" },
                { text: "LAWAN", to: "end2", tag: "LAWAN" }
            ]
        },
        // Ending tidak punya choices (pilihan)
        end1: { label: "ENDING 1 (HILANG)", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", choiceAt: null },
        end2: { label: "ENDING 2 (SELAMAT)", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4", choiceAt: null }
    };

    let currentSceneKey = "intro";
    let choiceShown = false;
    let pathHistory = [];

    // --- 3. FUNGSI NAVIGASI HALAMAN (HOME <-> PLAYER) ---

    // Saat tombol "MULAI FILM" diklik
    startBtn.addEventListener("click", () => {
        landingView.classList.add("hidden"); // Sembunyikan Home
        playerView.classList.remove("hidden"); // Munculkan Player
        loadScene("intro"); // Putar video intro
    });

    // Saat tombol "KEMBALI" diklik
    backBtn.addEventListener("click", () => {
        player.pause(); // Stop video
        playerView.classList.add("hidden"); // Sembunyikan Player
        landingView.classList.remove("hidden"); // Munculkan Home
        
        pathHistory = []; // Reset jejak
        if (document.fullscreenElement) {
            document.exitFullscreen(); // Keluar fullscreen jika aktif
        }
    });

    // --- 4. LOGIKA PLAYER & PILIHAN ---

    function loadScene(key) {
        const scene = SCENES[key];
        if (!scene) return;

        currentSceneKey = key;
        choiceShown = false;
        
        // Update Teks Label
        sceneLabel.textContent = "SCENE: " + scene.label;
        pathLabel.textContent = "PATH: " + (pathHistory.length ? pathHistory.join(" > ") : "-");
        
        // Sembunyikan Overlay Pilihan
        overlay.classList.remove("show");

        // Load & Play Video
        player.src = scene.src;
        player.load();
        
        const playPromise = player.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Auto-play dicegah browser. User perlu klik manual.");
            });
        }
    }

    function showChoices(scene) {
        modalPrompt.textContent = scene.prompt;
        modalButtons.innerHTML = ""; // Bersihkan tombol lama

        // Buat tombol baru
        scene.choices.forEach(choice => {
            const btn = document.createElement("button");
            btn.textContent = choice.text;
            btn.addEventListener("click", () => {
                pathHistory.push(choice.tag); // Simpan keputusan
                loadScene(choice.to); // Lanjut ke scene berikutnya
            });
            modalButtons.appendChild(btn);
        });

        overlay.classList.add("show"); // Munculkan popup
    }

    // Cek waktu video terus menerus
    player.addEventListener("timeupdate", () => {
        const scene = SCENES[currentSceneKey];
        // Jika scene ini punya pilihan & belum muncul
        if (scene && scene.choiceAt !== null && !choiceShown) {
            // Jika durasi video sudah melewati waktu pilihan
            if (player.currentTime >= scene.choiceAt) {
                choiceShown = true;
                player.pause(); // Stop video
                showChoices(scene); // Munculkan pilihan
            }
        }
    });

    // --- 5. TOMBOL KONTROL PLAYER ---

    restartBtn.addEventListener("click", () => {
        pathHistory = [];
        loadScene("intro");
    });

    fsBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            stage.requestFullscreen().catch(err => {
                alert(`Error fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
});