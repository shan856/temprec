document.addEventListener('DOMContentLoaded', () => {
    // --- MODAL ELEMENTS ---
    const headphoneModal = document.getElementById('headphone-warning-modal');
    const proceedAnywayBtn = document.getElementById('proceed-anyway-btn');
    let audioPlayIntent = false;

    // --- THEME TOGGLE ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = localStorage.getItem('theme');

    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'light');
        }
    }
    if (currentTheme) { setTheme(currentTheme); } else { setTheme('dark'); }
    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) { setTheme('light'); } else { setTheme('dark'); }
    });

    // --- PLAYER ELEMENTS ---
    const audio = document.getElementById('audio-element');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const skipForwardBtn = document.getElementById('skip-forward-btn');
    const skipBackwardBtn = document.getElementById('skip-backward-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalDurationDisplay = document.getElementById('total-duration');
    const trackTitleDisplay = document.getElementById('track-title');
    const trackArtistDisplay = document.getElementById('track-artist');
    const trackFormatDisplay = document.getElementById('track-format');
    const trackFormatSeparator = document.getElementById('track-format-separator');
    const trackErrorDisplay = document.getElementById('track-error');
    const playlistElement = document.getElementById('playlist');
    const externalTrackDescriptionArea = document.getElementById('external-track-description-area');
    const externalTrackDescriptionContent = document.getElementById('external-track-description-content');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // --- EQ ELEMENTS AND DATA ---
    const eqSliders = document.querySelectorAll('.eq-slider');
    const eqGainValues = document.querySelectorAll('.eq-gain-value');
    const resetEqBtn = document.getElementById('reset-eq-btn');
    const presetButtons = document.querySelectorAll('.eq-preset-btn');
    let audioContext;
    let audioElementSource;
    let gainNode;
    let eqFilters = [];
    const eqFrequencies = [60, 230, 910, 3600, 14000];
    const defaultEQSettings = { gains: [5.5, -15, -15, 0, 15], presetName: "custom1" };
    const eqPresets = {
        custom1: [...defaultEQSettings.gains], custom2: [0, -20, -15, 0, 0], manual: [...defaultEQSettings.gains],
        regular: [0,0,0,0,0], flat: [0,0,0,0,0]
    };
    let activePreset = defaultEQSettings.presetName;

    // --- MASTER TRACKS DATA (Corrected Order and Categories) ---
    const masterTracks = [
    {
        title: "generator talking on the day of powercut",
        artist: "10:48- 11:10",
        src: "./audios/sec noon/generator talking on the day of powercut.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "Sujay keeps asking us every day how long the generator has been running. We just keep telling him, ‘Only a little bit, just a little bit.’ And for that Thika replies, ‘Avru enu madalla, Sujay,’ meaning ‘They’re not doing anything, Sujay."
    },
    {
        title: "normally talking of office shits",
        artist: "11:15 - 12:10",
        src: "./audios/sec noon/normally talking of office shits.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "Savitha mentioned that in the beginning, the school staff used to create a new app almost every single day. In response, Sujay said, 'Forget about the school stuff—let’s focus on our issue. Even after a whole day, no one has completed even a single tile. That’s what’s bothering me.He also pointed out that we lost two hours because of the generator repair. Lastly, he talked about what Sanjay had said—“ivathu avnu raje hakuva antha helthane” (he was suggesting we declare today a holiday), so we could fix the generator and continue the work tomorrow. But unfortunately, others misunderstood that as something else."
    },
    {
        title: "talking about sharanya for leaving on the power cut day",
        artist: "12:10-13:14",
        src: "./audios/sec noon/talking about sharanya for leaving on the power cut.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "This is about Sharanya on the day of the power shutdown. When asked what she did, Thika replied, “She just came and left—there was no power anyway.” But the truth is, Sharanya had clearly informed everyone that she was on leave that day. Still, she came in just to complete an urgent file. And this is what she got in return.Thika told Sujay, We definitely need that data—they have to complete it."
    },
    {
        title: "free speech on project they were talking",
        artist: "13:50- 14:32",
        src: "./audios/sec noon/free speech on project they were talking.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "They were casually discussing the project, saying, We can’t afford to lose even a single penny—there’s too much money at stake, Sujay.” In response, Sujay said, It’s a simple project, but we’re making it complicated"
    },
    {
        title: "thikas preception on us doing nothing not working",
        artist: "14:30 15:00",
        src: "./audios/sec noon/thikas preception on us doing nothing not working.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "Thika was saying we should give the Netherlands project outside and take the Germany project in. For that, Sujay said, “We can’t compromise on quality.” Then Thika replied, “Ivaru maathra enu quality kodthare, and file banddhilla.” sujay added, “If the file is not completed, then sit complete and go—as you guys are sitting till 12 anyway."
    },
    {
        title: "sujay saying they need to spoon feed us and praksh sir did nothing",
        artist: "15:00 16:20",
        src: "./audios/sec noon/sujay saying they need to spoon feed and praksh sir did nothing.mp3", // Was already lowercase, verified
        category: "PWRDCNV",
        description: "Sujay said that 'still we guys need to be spoon-fed'. Then he talked about Prakash and Kanagaraj, saying 'adhu eno, aa Prakash and Kanagaraj maadidhra—kaali above line below line'. For that, Thika replied 'avru enu madilla Sujay'. Sujay added 'ondhu dhina nu QC madilla, but guys know about them'.Meanwhile, Savitha said she feels ashamed of them. Prakash sir came to help these guys when he was earning 80k salary, but here they gave him only 35k. In the last three months, they didn’t pay his salary at all. Even Sujay borrowed 5-6k from Prakash, but Sujay says he has already repaid him fully. the reason Prakash sir left the company was because they didn’t give him any documents or salary. And the same talks are happening behind the scenes for him too."
    },
    {
        title: "sujay saying he observes everything",
        artist: "17:50-19:00",
        src: "./audios/sec noon/sujay saying he observes everything.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "Thika said that she clears any doubts if they arise for you guys, but she can’t keep observing anyone. To that, Sujay said observe maadudhu naan maadthene. Then Savitha said chur saa, think maadtha illaa."
    },
    {
        title: "thika and sujay talking about qgis shits it might fun to hear",
        artist: "19:00 - 22:38",
        src: "./audios/sec noon/thika and sujay talking about qgis shits it might fun to hear.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "Sujay said that we had coded the POI count as high, but actually, it was mentioned as low on our side. He asked, can't we even match the POI count correctly? Then Thika responded saying, Kodthive alla dhuddu we are giving the money, right?.But the truth is, in the beginning, they clearly said there's no need to mention the POI count in Excel—for some time at least. I’m not sure if everyone remembers this, but that’s what happened. Many people didn’t mention the POI count in Excel, even now. And now they’re pointing it out.Also, the price per POI was ₹10 in the early stages, but now it has increased to ₹13–₹15. So when Savitha said that one POI is paid in single digits, that’s not true.Meanwhile, Thika is asking for extra incentives or more money, saying she brought in some people for the QGIS project. And here’s where the rest of the audio continues."
    },
    {
        title: "they were talking about moving sharanya to lidar and about the place changing",
        artist: "22:38 - 23:31",
        src: "./audios/sec noon/they were talking about moving sharanya to lidar and about the place changing.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "Savitha and sujay suggested moving Sharanya to the LiDAR work, not Thika. She said that they should be assigned to sit at specific places, and those places shouldn’t be changed on their own. If we strictly follow this, eventually they will start working the way we want.Sujay then asked, will Sharanya do the QC?"
    },
    {
        title: "dedicated employee deekshit and Pratham",
        artist: "24:10 25:00",
        src: "./audios/sec noon/dedicated employee deekshit and pratham.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "They were talking about Deekshit and Pratham, saying they were working really well. They also said, let’s keep Inchaara as the sole TL — we don’t need anyone else."
    },
    {
        title: "talking about TL and about projects",
        artist: "25:00-26:40",
        src: "./audios/sec noon/talking about tl and about projects.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "This is the continuation of the previous audio. They decided to keep Inchaara as the TL and chose Akshya for the next project. Later, they started talking about me and Anson, saying that we don’t ask any doubts or questions. You can hear the rest in the remaining audio."
    },
    {
        title: "sujay denying he said kalla to Sanjay",
        artist: "MCNV Morning",
        src: "./audios/morning/sujay denying he said kalla to sanjay.mp3", // Was already correct, verified
        category: "MCNV",
        description: "Sujay denies calling Sanjay a kalla (thief), but wait for the next audio. even sanjay knows this "
    },
    {
        title: "Sanjay being called kalla which he absolutely denied and abt mee too", // Title kept as user had it
        artist: "27:08 - 28:10",
        src: "./audios/sec noon/Sanjay being called kalla which he absolutely denaied and abt mee too 1st is abt Sanjay second is abt me.mp3", // Matched to actual long filename, corrected extension case
        category: "PWRDCNV",
        description: "In this audio, Sujay suddenly points at Sanjay’s place, calling him kalla (thief). I don’t know why he said that, so I asked Sujay to confirm in the monday morning u guys heard, but he denied saying anything like that to Sanjay.Later, Thika says to Sujay that Sanjay doesn’t sit at his system or do QC he just roams here and there and talks with the LiDAR members without actually working.Sujay then asks Sanjay, “avanigu idhaku en sammandha?” (What does this have to do with thim?)Later, thika says that Sanjay is not at his system, while me (shashank) is at his system but doesn’t work—he just looks at his mobile."
    },
    {
        title: "sujay denying me manipulating sharnaya",
        artist: "MCNV Morning",
        src: "./audios/morning/sujay denying me manipulating sharnaya said.mp3", // Was already correct, verified
        category: "MCNV",
        description: "Sujay denies saying that he manipulated Sharanya. As for the other things I mentioned, I personally got that information from Prakash sir.."
    },
    {
        title: "sujay saying i'm manipulating sharanya",
        artist: "23:33 - 23:40",
        src: "./audios/sec noon/sujay saying i'm manipulating sharanya.mp3", // Was already correct, verified
        category: "PWRDCNV",
        description: "Sujay said that by having Sharanya sit beside me, i manipulated her mind to lose interest in QGIS. He mentioned that Sharanya was initially interested in QGIS, but later her interest changed because of me.."
    },
    {
        title: "sujay denying again none of it doesn't matter",
        artist: "MCNV Morning",
        src: "./audios/morning/sujay denying again none of it diesnt matter.mp3", // Was already correct, verified (filename has "diesnt")
        category: "MCNV",
        description: "Here too, he is denying that he said anything personal about others.."
    },
    {
        title: "they saying they wont talk behind our back",
        artist: "MCNV Morning",
        src: "./audios/morning/they saying they wont talk behind our back.mp3", // Was already correct, verified
        category: "MCNV",
        description: "Sujay says she is his team member, even though he talks about them in unwanted ways. He also confirmed that there is nothing unethical being said about any of us. However, I have heard many of our names mentioned—Rathan, Dhanush, me, girls too—but I won’t name them all."
    },
    {
        title: "this is when thika came and said those about deliberately said it",
        artist: "MCNV Morning",
        src: "./audios/morning/this is when thika came and sad those.mp3", // Was already correct, verified (filename has "sad")
        category: "MCNV",
        description: "This is where Thika entered the conversation. Sujay said that without her or Savitha, he wouldn’t discuss anything at all. He then asked if he had said anything like that about himself, and Thika denied that he did. But I had already heard these things before Thika even arrived.Thika responded by saying, 'That’s your personal matter. we dont want that' But here’s the key part—she asked, 'How does he know everything we talk about inside the cabin?' That clearly shows they were talking behind our backs. She even deliberately said, 'Naav nimge kelbek anthane maathadudhu', meaning 'I was talking as if we should hear it.'Then Thika said, 'Idhalla bekitha? sujay'(Was all this really necessary?), and Sujay avoided talking further about it—likely because he knows he actually said those things to each one of us.Later, Thika asked, 'Nivu offer letter kottidhira?' (Did you give an offer letter?), to which Sujay replied, 'Illa.'' Thika then said, 'Then how can you give an experience letter?'"
    },
    {
        title: "contains termination again denying and salary on Sunday bonus and experience letter in after",
        artist: "MCNV Morning",
        src: "./audios/morning/contains termination again denyment and sala on sunday bonus and exper in after.mp3", // Was already correct, verified (filename has "denyment", "sala", "exper")
        category: "MCNV",
        description: "n this part, Sujay says that pay is not calculated based on the time you spend in the office, but only on your performance, which is more profitable for them.Then comes the experience letter topic again—some vague, back-and-forth comments, just more of the same “blah blah blah.” Regarding salaries: that Thika is getting ₹45K, Prakash sir ₹35K, and Nagaraj sir ₹26K. They even talked about giving incentives to Nagaraj sir, but it’s unclear how true that is.Later in the audio, Sujay again denies calling Sanjay a 'kalla' (thief), even though it was clearly heard in a previous recording. Any time they hit a dead end in a conversation with me—especially when they risk exposing themselves—they quickly switch topics to avoid getting caught saying something they shouldn’t.Then Thika suddenly starts saying to Sujay, “Idhella namge bekka, termination maadi ashte”, and honestly, I don’t know wtf she was thinking.Once again, the experience letter issue comes up. And regarding Sunday work, they don’t pay overtime—it’s the same pay as a normal day, which really doesn’t justify the value of our time. Whether or not they will even give bonuses to us is also uncertain."
    },
    {
        title: "chir sala ex start",
        artist: "MCNV Morning",
        src: "./audios/morning/chir sala ex start.mp3", // Was already correct, verified
        category: "MCNV",
        description: "this the converstaion of the starting u can ignore this audio '."
    },
    {
        title: "convo bwt savitha sujay call about sal to chirasri and insha",
        artist: "MCNV Morning",
        src: "./audios/morning/convo bwt savitha sujat call about sal to chirasri and insha.mp3", // Was already correct, verified (filename has "sujat")
        category: "MCNV",
        description: "In this part, Sujay called Savitha to ask whether the full salary was paid to Chirasri and Insha. The truth is—they weren’t paid in full. Sujay claimed he gave them the full salary, but he didn't.When he called Savitha, she said they only paid ₹9,000 each, and ₹3,000 was withheld because Chirasri and Insha left the company without informing anyone.At one point in end of january , Sujay also called me and said, “If they’re not interested in working here, they can leave the company.” I told them exactly that. Additionally, Sujay said, “Avaru illi timepass ge kelsakke barudhu, aadhre avarannu naan timepass maadisthini.” I'm not entirely sure what he meant by that, but that’s what he told me directly inside the cabin—with Sanjay also present.Then, for the second time, after realizing that the full salary hadn't actually been paid, Sujay quickly tried to change the topic again—just like before—likely to avoid taking accountability."
    },
    {
        title: "savitha saying we are mobile addict and thika saying not turning on the light",
        artist: "31:58-32:44",
        src: "./audios/sec noon/savitha saying we are mobile addict and thika saying not turning on the light.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "In this part, Savitha says that all of us are mobile addicts, and Thika adds that we're only watching movies, playing games, and doing other unrelated things. If this includes you guys too, i'm sorry guys cause i was the one who does.”There’s also something Thika mentioned—she said we turned on the light today for the first time, and until now, she hadn’t been allowing it. I believe this part is not in the current clip, but it’s in the original audio after the 32:00 mark. It’s connected to the denoised version of the Thika conversation from the power cut day, so you can listen to that full audio for confirmation."
    },
    {
        title: "diseal and gen some other things u can hear if u want to",
        artist: "PWRDCNV Misc",
        src: "./audios/sec noon/diseal and gen some other things u can hear if u want to.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "And this audio is just about Nothing, but they were mainly discussing the generator and fuel. You can listen to it if you want to."
    },
    {
        title: "mini convo bwt ans me Sujay",
        artist: "MCNV Morning",
        src: "./audios/morning/mini convo bwt ans me sujay.mp3", // Was already correct, verified (filename "sujay" lowercase)
        category: "MCNV",
        description: "Mini conversation, Sujay answers."
    },
    {
        title: "full audio denoised of the thika convo on power cut day",
        artist: "PWRDCNV Denoised",
        src: "./audios/sec noon/full audio denoised of the thika convo.mp3", // Corrected extension case
        category: "PWRDCNV",
        description: "This is the full 1 hour 16 minute Denoised audio from the power cut day, where Sujay, Savitha, and Thika were having a discussion."
    },
    {
        title: "full audio on Monday office convo",
        artist: "MCNV Morning",
        src: "./audios/morning/full audio on Monday office convo.mp3", // Was already correct, verified
        category: "MCNV",
        description: "and this is the audio of monday that everything happened in office"
    },
    {
        title: "full audio original of the thika convo without denoising",
        artist: "PWRDCNV Original",
        src: "./audios/sec noon/full audio original of the thika convo.m4a", // Corrected extension case from .M4A to .m4a
        category: "PWRDCNV",
        description: "This is the full 1 hour 16 minute audio from the power cut day, where Sujay, Savitha, and Thika were having a discussion. which is not denoised it contains more noise than think"
    },
    {
        title: "05-26-2025 10.43 am Recording", // Title kept as user had it
        artist: "MCNV Morning",
        src: "./audios/morning/05-26-2025 10.43 am.m4a", // Corrected src to point to the actual .m4a file
        category: "MCNV",
        description: "Morning recording between me and sujay"
    },
    {
        title: "Tool Deletion and Knowledge",
        artist: "MCNV Morning",
        src: "./audios/morning/tool never allowed to delete, brain knowledge and things.mp3", // Was already correct, verified
        category: "MCNV",
        description: "In this part, Sujay refused to delete the QC software, saying he had paid for it. But as I’ve said before, he didn’t pay me to create those tools, and no office resources were used in their development.If anything I said while talking about the knowledge or comparison between us came off the wrong way, I’m sorry again, guys."
    },
    {
        title: "Sujay Sir 26-05-2025 3.04 pm",
        artist: "Call Recording",
        src: "./audios/call/Sujay Sir 26-05-2025 3.04 pm call recording.mp3", // Corrected extension case
        category: "Call",
        description: "Call recording with Sujay Sir on 26-05-2025 at 3.04 PM."
    },
    {
        title: "Sujay Sir 26-05-2025 5.32 pm",
        artist: "Call Recording",
        src: "./audios/call/Sujay Sir 26-05-2025 5.32 pm call recording.mp3", // Corrected extension case
        category: "Call",
        description: "Call recording with Sujay Sir on 26-05-2025 at 5.32 PM."
    },
    {
        title: "Sujay Sir 27-05-2025 6.10 pm",
        artist: "Call Recording",
        src: "./audios/call/Sujay Sir 27-05-2025 6.10 pm call recording.mp3", // Corrected extension case
        category: "Call",
        description: "Call recording with Sujay Sir on 27-05-2025 at 6.10 PM."
    }
];

    let currentTracklist = [...masterTracks];
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isAudioContextInitialized = false;

    function showHeadphoneWarning() { if (headphoneModal) headphoneModal.classList.add('visible'); }
    function hideHeadphoneWarningAndProceed() { if (headphoneModal) headphoneModal.classList.remove('visible'); if (audioPlayIntent) { actuallyPlayAudio(); audioPlayIntent = false; } }
    if (proceedAnywayBtn) proceedAnywayBtn.addEventListener('click', hideHeadphoneWarningAndProceed);

    function updateSliderFill(slider) { if (!slider) return; const min = parseFloat(slider.min); const max = parseFloat(slider.max); const val = parseFloat(slider.value); let percentage = 0; if (max - min !== 0) percentage = ((val - min) * 100) / (max - min); else if (max === min && val >= min) percentage = 100; slider.style.setProperty('--value-percent', `${percentage}%`);}

    function getFormatFromSrc(src) { if (typeof src !== 'string' || src === '') return ''; const extension = src.substring(src.lastIndexOf('.') + 1).toLowerCase(); switch (extension) { case 'm4a': return 'M4A'; case 'mp3': return 'MP3'; case 'wav': return 'WAV'; case 'ogg': return 'OGG'; default: return extension.toUpperCase(); } }
    function displayTrackError(message) { trackErrorDisplay.textContent = message; trackErrorDisplay.style.display = 'block'; trackFormatDisplay.textContent = ''; trackFormatSeparator.style.display = 'none'; if (externalTrackDescriptionContent) externalTrackDescriptionContent.textContent = ''; if (externalTrackDescriptionArea) externalTrackDescriptionArea.style.display = 'none'; }
    function clearTrackError() { trackErrorDisplay.style.display = 'none'; trackErrorDisplay.textContent = ''; }
    function initAudioProcessing() { if (isAudioContextInitialized) return; try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); audioElementSource = audioContext.createMediaElementSource(audio); gainNode = audioContext.createGain(); eqFilters = eqFrequencies.map((freq, i) => { const filter = audioContext.createBiquadFilter(); filter.type = 'peaking'; filter.frequency.value = freq; filter.Q.value = 1.2; filter.gain.value = eqSliders[i] ? parseFloat(eqSliders[i].value) : defaultEQSettings.gains[i]; return filter; }); if (eqFilters.length > 0) eqFilters[0].type = 'lowshelf'; let currentNode = audioElementSource; eqFilters.forEach(filter => { currentNode.connect(filter); currentNode = filter; }); currentNode.connect(gainNode); gainNode.connect(audioContext.destination); isAudioContextInitialized = true; console.log("AudioContext and EQ initialized."); eqSliders.forEach(slider => slider.disabled = false); if(resetEqBtn) resetEqBtn.disabled = false; presetButtons.forEach(btn => btn.disabled = false); } catch (e) { console.error("Error initializing Web Audio API:", e); displayTrackError("Audio effects (EQ) not available."); eqSliders.forEach(slider => slider.disabled = true); if(resetEqBtn) resetEqBtn.disabled = true; presetButtons.forEach(btn => btn.disabled = true); } }
    function scrollToActivePlaylistItem() { if (!playlistElement) return; const activeItem = playlistElement.querySelector('li.active'); if (activeItem) activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    function loadTrack(trackIndexInCurrentList, playWhenLoaded = false) { clearTrackError(); trackFormatDisplay.textContent = ''; trackFormatSeparator.style.display = 'none'; if (externalTrackDescriptionContent) externalTrackDescriptionContent.textContent = ''; if (externalTrackDescriptionArea) externalTrackDescriptionArea.style.display = 'none'; if (trackIndexInCurrentList >= 0 && trackIndexInCurrentList < currentTracklist.length) { const track = currentTracklist[trackIndexInCurrentList]; audio.src = track.src; trackTitleDisplay.textContent = track.title; trackArtistDisplay.textContent = track.artist; const format = getFormatFromSrc(track.src); if (format) { trackFormatDisplay.textContent = format; trackFormatSeparator.style.display = 'inline'; } if (track.description && externalTrackDescriptionContent && externalTrackDescriptionArea) { externalTrackDescriptionContent.textContent = track.description; externalTrackDescriptionArea.style.display = 'block'; } currentTrackIndex = trackIndexInCurrentList; updatePlaylistActiveState(currentTrackIndex); scrollToActivePlaylistItem(); progressBar.value = 0; progressBar.max = 100; updateSliderFill(progressBar); currentTimeDisplay.textContent = '0:00'; totalDurationDisplay.textContent = '0:00'; audioPlayIntent = playWhenLoaded; } else { displayTrackError("Track not found in current list."); trackTitleDisplay.textContent = "Error"; trackArtistDisplay.textContent = "Unknown"; totalDurationDisplay.textContent = 'N/A'; if (externalTrackDescriptionArea) externalTrackDescriptionArea.style.display = 'none'; } }
    function updatePlaylistActiveState(activeIndexInCurrentList) { playlistElement.querySelectorAll('li').forEach((item, index) => { item.classList.toggle('active', index === activeIndexInCurrentList); }); }
    function actuallyPlayAudio() { if (!isAudioContextInitialized && currentTracklist.length > 0) initAudioProcessing(); if (audioContext && audioContext.state === 'suspended') audioContext.resume().catch(e => console.warn("AudioContext resume failed", e)); const playPromise = audio.play(); if (playPromise !== undefined) playPromise.then(() => { isPlaying = true; playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; playPauseBtn.setAttribute('aria-label', 'Pause track'); clearTrackError(); audioPlayIntent = false; }).catch(error => { console.error("Error playing track:", error); displayTrackError(`Cannot play: ${error.name}.`); isPlaying = false; playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; playPauseBtn.setAttribute('aria-label', 'Play track'); audioPlayIntent = false; }); }
    function pauseAudio() { audio.pause(); isPlaying = false; audioPlayIntent = false; playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; playPauseBtn.setAttribute('aria-label', 'Play track'); }
    function togglePlayPause() { if (!audio.src || audio.src === window.location.href || audio.src === "") { if (currentTracklist.length > 0) loadTrack(currentTrackIndex, true); else { displayTrackError("No tracks to play."); return; } } if (isPlaying) pauseAudio(); else { audioPlayIntent = true; if (headphoneModal && headphoneModal.classList.contains('visible')) { /* Modal open */ } else { actuallyPlayAudio(); } } }
    function playNextTrack() { if (currentTracklist.length === 0) { displayTrackError("No tracks in playlist."); return; } currentTrackIndex = (currentTrackIndex + 1) % currentTracklist.length; loadTrack(currentTrackIndex, true); }
    function playPrevTrack() { if (currentTracklist.length === 0) { displayTrackError("No tracks in playlist."); return; } currentTrackIndex = (currentTrackIndex - 1 + currentTracklist.length) % currentTracklist.length; loadTrack(currentTrackIndex, true); }
    function skipTime(seconds) { if (audio.src && !isNaN(audio.duration)) { const newTime = audio.currentTime + seconds; audio.currentTime = Math.max(0, Math.min(newTime, audio.duration)); } }
    function updateProgress() { const { duration, currentTime } = audio; if (duration && !isNaN(duration)) currentTimeDisplay.textContent = formatTime(currentTime); else currentTimeDisplay.textContent = '0:00'; }
    function seekProgress() { const duration = audio.duration; if (duration && !isNaN(duration)) audio.currentTime = parseFloat(progressBar.value); }
    function formatTime(seconds) { const roundedSeconds = Math.floor(seconds || 0); const minutes = Math.floor(roundedSeconds / 60); const secs = roundedSeconds % 60; return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; }
    function populatePlaylist(tracksToDisplay = masterTracks) {
        playlistElement.innerHTML = '';
        tracksToDisplay.forEach((track, indexInDisplayedList) => {
            const li = document.createElement('li');
            li.tabIndex = 0;
            const titleSpan = document.createElement('span');
            titleSpan.className = 'playlist-track-title';
            titleSpan.textContent = track.title;
            const artistSpan = document.createElement('span');
            artistSpan.className = 'playlist-track-artist';
            artistSpan.textContent = track.artist;
            const format = getFormatFromSrc(track.src);
            if (format) {
                const formatSpan = document.createElement('span');
                formatSpan.className = 'playlist-track-format';
                formatSpan.textContent = ` (${format})`;
                artistSpan.appendChild(formatSpan);
            }
            li.appendChild(titleSpan);
            li.appendChild(artistSpan);
            li.setAttribute('data-index', indexInDisplayedList);
            li.setAttribute('role', 'button');
            function handlePlaylistItemInteraction() {
                currentTracklist = tracksToDisplay;
                loadTrack(indexInDisplayedList, true);
            }
            li.addEventListener('click', handlePlaylistItemInteraction);
            li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlaylistItemInteraction(); } });
            playlistElement.appendChild(li);
        });
    }
    function filterPlaylist(category) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.filter-btn[data-filter="${category}"]`).classList.add('active');

        if (category === 'all') {
            currentTracklist = [...masterTracks];
        } else {
            currentTracklist = masterTracks.filter(track => track.category === category);
        }
        populatePlaylist(currentTracklist);
        if (currentTracklist.length > 0) {
            const currentAudioSrc = audio.src; // Get the src of the currently loaded audio
            const stillPlayingTrackIndex = currentTracklist.findIndex(track => track.src === currentAudioSrc);

            if (isPlaying && stillPlayingTrackIndex !== -1) {
                currentTrackIndex = stillPlayingTrackIndex; // Update currentTrackIndex to match the new list
                loadTrack(currentTrackIndex, true); // Reload to ensure UI consistency, keep playing
            } else {
                loadTrack(0, false); // Load the first track of the new filtered list, don't autoplay
            }
        } else {
            displayTrackError("No tracks found for this filter.");
            audio.src = "";
            trackTitleDisplay.textContent = "No Tracks";
            trackArtistDisplay.textContent = "";
            if (externalTrackDescriptionArea) externalTrackDescriptionArea.style.display = 'none';
        }
    }
    function applyEQGains(gainsArray) { eqSliders.forEach((slider, index) => { if (gainsArray[index] !== undefined) { slider.value = gainsArray[index]; if (eqGainValues[index]) { const gainValue = parseFloat(slider.value); eqGainValues[index].textContent = `${gainValue >= 0 ? '+' : ''}${gainValue.toFixed(1)}dB`; } if (isAudioContextInitialized && eqFilters[index]) eqFilters[index].gain.value = parseFloat(slider.value); } }); }
    function setActivePresetButton(presetName) { presetButtons.forEach(button => button.classList.toggle('active', button.dataset.preset === presetName)); activePreset = presetName; }
    function manualEQChange() { let currentManualGains = []; eqSliders.forEach((slider, index) => { const gainValue = parseFloat(slider.value); currentManualGains.push(gainValue); if (eqGainValues[index]) eqGainValues[index].textContent = `${gainValue >= 0 ? '+' : ''}${gainValue.toFixed(1)}dB`; if (isAudioContextInitialized && eqFilters[index]) eqFilters[index].gain.value = gainValue; }); eqPresets.manual = currentManualGains; setActivePresetButton("manual"); presetButtons.forEach(button => { if (button.dataset.preset !== 'manual') button.classList.remove('active');}); }
    function applyFlatPreset() { applyEQGains(eqPresets.flat); setActivePresetButton("flat"); }

    playPauseBtn.addEventListener('click', togglePlayPause); nextBtn.addEventListener('click', playNextTrack); prevBtn.addEventListener('click', playPrevTrack); skipForwardBtn.addEventListener('click', () => skipTime(10)); skipBackwardBtn.addEventListener('click', () => skipTime(-10));
    audio.addEventListener('loadedmetadata', () => { if (audio.duration && !isNaN(audio.duration)) { totalDurationDisplay.textContent = formatTime(audio.duration); progressBar.max = audio.duration; } else { totalDurationDisplay.textContent = 'N/A'; progressBar.max = 100; } progressBar.value = 0; updateSliderFill(progressBar); updateProgress(); clearTrackError(); if (audioPlayIntent && (!headphoneModal || !headphoneModal.classList.contains('visible'))) { actuallyPlayAudio(); } });
    audio.addEventListener('error', (e) => { console.error("Audio Element Error:", e); let errorMsg = "Error loading track."; if (audio.error) { /* error codes */ } displayTrackError(errorMsg); trackTitleDisplay.textContent = "Error"; trackArtistDisplay.textContent = masterTracks[currentTrackIndex]?.title || "Unknown Track"; totalDurationDisplay.textContent = 'Error'; isPlaying = false; audioPlayIntent = false; playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; playPauseBtn.setAttribute('aria-label', 'Play track'); progressBar.value = 0; progressBar.max = 100; updateSliderFill(progressBar); });
    audio.addEventListener('timeupdate', () => { if (audio.duration && !isNaN(audio.duration)) { progressBar.value = audio.currentTime; updateSliderFill(progressBar); } updateProgress(); });
    audio.addEventListener('ended', playNextTrack);
    progressBar.addEventListener('input', () => { seekProgress(); updateSliderFill(progressBar); });
    volumeSlider.addEventListener('input', (e) => { audio.volume = parseFloat(e.target.value); updateSliderFill(volumeSlider); });
    eqSliders.forEach(slider => { slider.addEventListener('input', () => { manualEQChange(); updateSliderFill(slider); }); });
    if(resetEqBtn) { resetEqBtn.addEventListener('click', () => { applyFlatPreset(); eqSliders.forEach(slider => updateSliderFill(slider)); }); }
    presetButtons.forEach(button => { button.addEventListener('click', () => { const presetName = button.dataset.preset; if (eqPresets[presetName]) { applyEQGains(eqPresets[presetName]); setActivePresetButton(presetName); eqSliders.forEach(slider => updateSliderFill(slider)); } }); });
    filterButtons.forEach(button => { button.addEventListener('click', () => filterPlaylist(button.dataset.filter)); });

    function initializePlayer() {
        eqSliders.forEach((slider, index) => { if (defaultEQSettings.gains[index] !== undefined) { slider.value = defaultEQSettings.gains[index]; if (eqGainValues[index]) { const gainValue = parseFloat(slider.value); eqGainValues[index].textContent = `${gainValue >= 0 ? '+' : ''}${gainValue.toFixed(1)}dB`;}}});
        if (masterTracks.length > 0) {
            populatePlaylist(currentTracklist);
            loadTrack(currentTrackIndex, false);
            playPauseBtn.disabled = false; prevBtn.disabled = false; nextBtn.disabled = false;
            skipForwardBtn.disabled = false; skipBackwardBtn.disabled = false;
            progressBar.disabled = false; filterButtons.forEach(btn => btn.disabled = false);
            showHeadphoneWarning();
        } else {
            displayTrackError("No tracks defined in the script.");
            trackTitleDisplay.textContent = "No Tracks"; trackArtistDisplay.textContent = "Add tracks";
            if (externalTrackDescriptionArea) externalTrackDescriptionArea.style.display = 'none';
            playPauseBtn.disabled = true; prevBtn.disabled = true; nextBtn.disabled = true;
            skipForwardBtn.disabled = true; skipBackwardBtn.disabled = true;
            progressBar.disabled = true; eqSliders.forEach(slider => slider.disabled = true);
            if(resetEqBtn) resetEqBtn.disabled = true;
            presetButtons.forEach(btn => btn.disabled = true); filterButtons.forEach(btn => btn.disabled = true);
        }
        applyEQGains(eqPresets[defaultEQSettings.presetName]); setActivePresetButton(defaultEQSettings.presetName);
        updateSliderFill(progressBar); updateSliderFill(volumeSlider); eqSliders.forEach(slider => updateSliderFill(slider));
    }
    initializePlayer();
});