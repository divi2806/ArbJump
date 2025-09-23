class SpaceJumpGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.startScreenElement = document.getElementById('startScreen');
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.highestY = 0;
        this.frameCount = 0;
        
        // Canvas setup
        this.setupCanvas();
        
        // Game objects
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.camera = { y: 0 };
        this.particles = [];
        
        // Game progression
        this.coinsCollected = 0;
        this.speedMultiplier = 1;
        
        // Assets
        this.assets = {};
        this.assetsLoaded = 0;
        this.totalAssets = 0;
        
        // Input
        this.keys = {};
        this.touches = {};
        
        // Game settings
        this.gravity = 0.8;
        this.jumpForce = -15; // More natural jump force
        this.playerSpeed = 7; // Slightly slower for better control
        this.platformSpacing = 100; // Consistent with initial generation
        
        this.loadAssets();
        this.setupEventListeners();
    }
    
    setupCanvas() {
        // Set canvas size for mobile
        const maxWidth = Math.min(window.innerWidth, 400);
        const maxHeight = window.innerHeight;
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        // Set CSS size
        this.canvas.style.width = maxWidth + 'px';
        this.canvas.style.height = maxHeight + 'px';
        
        // Disable context menu
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    loadAssets() {
        const imageAssets = [
            'bg.png',
            'astronaut.png',
            'tilePurple.png',
            'tileRed.png',
            'tileYellow.png',
            'coin.png',
            'Wallpaper.png',
            'play.png',
            'exit.png',
            'topscorer.png',
            'bg2.png',
            'space2.png',
            'space3.png'
        ];
        
        const soundAssets = [
            'jump.wav',
            'coins.mp3'
        ];
        
        this.totalAssets = imageAssets.length + soundAssets.length;
        
        // Load image assets
        imageAssets.forEach(filename => {
            const img = new Image();
            img.onload = () => {
                this.assetsLoaded++;
                if (this.assetsLoaded === this.totalAssets) {
                    console.log('Assets loaded, starting game');
                    this.init();
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load image asset: ${filename}`);
                this.assetsLoaded++;
                if (this.assetsLoaded === this.totalAssets) {
                    console.log('Game starting (some assets failed)');
                    this.init();
                }
            };
            img.src = `assets/${filename}`;
            this.assets[filename.split('.')[0]] = img;
        });
        
        // Load sound assets
        soundAssets.forEach(filename => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.assetsLoaded++;
                if (this.assetsLoaded === this.totalAssets) {
                    console.log('Assets loaded, starting game');
                    this.init();
                }
            };
            audio.onerror = () => {
                console.warn(`Failed to load sound asset: ${filename}`);
                this.assetsLoaded++;
                if (this.assetsLoaded === this.totalAssets) {
                    console.log('Game starting (some assets failed)');
                    this.init();
                }
            };
            audio.src = `assets/${filename}`;
            this.assets[filename.split('.')[0]] = audio;
        });
    }
    
    init() {
        this.createPlayer();
        this.generateInitialPlatforms();
        this.gameLoop();
        console.log('Game initialized successfully');
    }
    
    createPlayer() {
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 200,
            width: 50,
            height: 50,
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            frame: 0,
            animationTimer: 0,
            direction: 1 // 1 for right, -1 for left
        };
    }
    
    generateInitialPlatforms() {
        this.platforms = [];
        
        // Starting platform
        this.platforms.push({
            x: this.canvas.width / 2 - 60,
            y: this.canvas.height - 100,
            width: 120,
            height: 20,
            type: 'normal',
            color: '#6464ff'
        });
        
        // Generate platforms going up
        for (let i = 1; i < 30; i++) {
            this.generatePlatform(i);
        }
    }
    
    generatePlatform(index) {
        const types = ['normal', 'moving', 'breakable'];
        const colors = ['#6464ff', '#ff6464', '#64ff64'];
        const tileAssets = ['tilePurple', 'tileRed', 'tileYellow'];
        
        let type = 'normal';
        let color = '#6464ff';
        let asset = 'tilePurple';
        
        if (index > 5) {
            const rand = Math.random();
            if (rand < 0.1) {
                type = 'breakable';
                color = '#ff6464';
                asset = 'tileRed';
            } else if (rand < 0.2) {
                type = 'moving';
                color = '#64ff64';
                asset = 'tileYellow';
            }
        }
        
        const platform = {
            x: Math.random() * (this.canvas.width - 120),
            y: this.canvas.height - 100 - (index * this.platformSpacing),
            width: 120,
            height: 20,
            type: type,
            color: color,
            asset: asset,
            moveDirection: Math.random() < 0.5 ? -1 : 1,
            moveSpeed: 1 + Math.random() * 1.2, // Slower moving platforms
            broken: false,
            breakTimer: 0
        };
        
        this.platforms.push(platform);
        
        // Add coin on platform with 30% chance
        if (Math.random() < 0.3) {
            this.createCoin(platform);
        }
    }
    
    createCoin(platform) {
        const coin = {
            x: platform.x + platform.width / 2 - 15, // Center on platform
            y: platform.y - 30, // Above platform
            width: 30,
            height: 30,
            frame: 0,
            animationTimer: 0,
            collected: false,
            platformY: platform.y // Reference for collision
        };
        this.coins.push(coin);
    }
    

    
    setupEventListeners() {
        // Touch controls
        document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = true;
        });
        
        document.getElementById('leftBtn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = false;
        });
        
        document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = true;
        });
        
        document.getElementById('rightBtn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = false;
        });
        
        // Mouse controls (for testing)
        document.getElementById('leftBtn').addEventListener('mousedown', () => {
            this.keys['ArrowLeft'] = true;
        });
        
        document.getElementById('leftBtn').addEventListener('mouseup', () => {
            this.keys['ArrowLeft'] = false;
        });
        
        document.getElementById('rightBtn').addEventListener('mousedown', () => {
            this.keys['ArrowRight'] = true;
        });
        
        document.getElementById('rightBtn').addEventListener('mouseup', () => {
            this.keys['ArrowRight'] = false;
        });
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Start screen buttons
        document.getElementById('startPlayBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('startLeaderboardBtn').addEventListener('click', () => {
            this.showTopScorer();
        });
        
        document.getElementById('startExitBtn').addEventListener('click', () => {
            this.confirmExit();
        });
        
        // Game over screen buttons
        document.getElementById('playBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('topScorerBtn').addEventListener('click', () => {
            this.showTopScorer();
        });
        
        document.getElementById('exitBtn').addEventListener('click', () => {
            this.exitGame();
        });
        
        // Prevent scrolling on mobile
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.setupCanvas();
            }, 100);
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.startScreenElement.style.display = 'none';
        this.score = 0;
        this.highestY = 0;
        this.particles = [];
        this.coins = [];
        this.coinsCollected = 0;
        this.speedMultiplier = 1;
        this.createPlayer();
        this.generateInitialPlatforms();
        this.camera.y = 0;
        
        console.log('Game started!');
    }
    
    restartGame() {
        this.gameState = 'playing';
        this.gameOverElement.style.display = 'none';
        this.score = 0;
        this.highestY = 0;
        this.particles = [];
        this.coins = [];
        this.coinsCollected = 0;
        this.speedMultiplier = 1;
        this.createPlayer();
        this.generateInitialPlatforms();
        this.camera.y = 0;
        
        console.log('Game restarted!');
    }
    
    showTopScorer() {
        // Get high score from localStorage or set default
        const highScore = localStorage.getItem('spaceJumpHighScore') || 0;
        alert(`🏆 HIGH SCORE: ${highScore} 🏆\n\n${this.score > highScore ? '🎉 NEW RECORD! 🎉' : 'Keep jumping to beat it!'}`);
        
        // Save new high score if current score is higher
        if (this.score > highScore) {
            localStorage.setItem('spaceJumpHighScore', this.score);
        }
    }
    
    exitGame() {
        // Show confirmation and return to start screen
        if (confirm('Are you sure you want to exit to the main menu?')) {
            this.gameState = 'start';
            this.gameOverElement.style.display = 'none';
            this.startScreenElement.style.display = 'flex';
            
            // Reset game state
            this.score = 0;
            this.highestY = 0;
            this.particles = [];
            this.coins = [];
            this.spikes = [];
            this.coinsCollected = 0;
            this.speedMultiplier = 1;
            this.camera.y = 0;
            
            console.log('Returned to main menu');
        }
    }
    
    playJumpSound() {
        // Play jump sound effect
        if (this.assets.jump && this.assets.jump.play) {
            try {
                this.assets.jump.currentTime = 0; // Reset to beginning
                this.assets.jump.volume = 0.3; // Set volume to 30%
                this.assets.jump.play().catch(e => {
                    console.log('Sound play failed:', e);
                });
            } catch (e) {
                console.log('Sound error:', e);
            }
        }
    }
    
    playCoinSound() {
        // Play coin collection sound effect when score increases
        if (this.assets.coins && this.assets.coins.play) {
            try {
                this.assets.coins.currentTime = 0; // Reset to beginning
                this.assets.coins.volume = 0.4; // Set volume to 40% (slightly louder than jump)
                this.assets.coins.play().catch(e => {
                    console.log('Coin sound play failed:', e);
                });
            } catch (e) {
                console.log('Coin sound error:', e);
            }
        }
    }
    
    confirmExit() {
        // Exit from start screen
        if (confirm('Are you sure you want to exit the game?')) {
            if (window.close) {
                window.close();
            } else {
                alert('Please close this tab manually.');
            }
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer();
        this.updatePlatforms();
        this.updateCoins();
        this.updateParticles();
        this.updateCamera();
        this.checkCollisions();
        this.checkCoinCollisions();
        this.updateScore();
        this.updateGameSpeed();
        this.checkGameOver();
        this.generateMorePlatforms();
    }
    
    updatePlayer() {
        // Handle input
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.velocityX = -this.playerSpeed;
            this.player.direction = -1;
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.velocityX = this.playerSpeed;
            this.player.direction = 1;
        } else {
            this.player.velocityX *= 0.8; // Friction
        }
        
        // Apply gravity
        this.player.velocityY += this.gravity;
        
        // Update position
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Screen wrapping
        if (this.player.x < -this.player.width / 2) {
            this.player.x = this.canvas.width + this.player.width / 2;
        } else if (this.player.x > this.canvas.width + this.player.width / 2) {
            this.player.x = -this.player.width / 2;
        }
        
        // Update jump state and animation
        this.updatePlayerAnimation();
        
        // Update highest Y for score
        if (this.player.y < this.highestY) {
            this.highestY = this.player.y;
        }
    }
    
    updatePlayerAnimation() {
        // Simple continuous animation like in reference game
        this.player.animationTimer++;
        
        // Cycle through frames at consistent speed (like Doodle Jump)
        if (this.player.animationTimer > 8) {
            this.player.frame = (this.player.frame + 1) % 4;
            this.player.animationTimer = 0;
            // Debug: log frame changes
            if (this.frameCount % 120 === 0) {
                console.log('Current frame:', this.player.frame);
            }
        }
    }
    
    updatePlatforms() {
        this.platforms.forEach(platform => {
            if (platform.type === 'moving') {
                platform.x += platform.moveDirection * platform.moveSpeed;
                
                if (platform.x <= 0 || platform.x >= this.canvas.width - platform.width) {
                    platform.moveDirection *= -1;
                }
            }
            
            if (platform.type === 'breakable' && platform.broken) {
                platform.breakTimer++;
                if (platform.breakTimer > 30) {
                    platform.y += 5; // Fall down
                }
            }
        });
        
        // Remove platforms that are too far down
        this.platforms = this.platforms.filter(platform => 
            platform.y < this.camera.y + this.canvas.height + 200
        );
    }
    
    updateCoins() {
        this.coins.forEach(coin => {
            if (!coin.collected) {
                // Animate coin
                coin.animationTimer++;
                if (coin.animationTimer > 8) {
                    coin.frame = (coin.frame + 1) % 4;
                    coin.animationTimer = 0;
                }
                
                // Add floating effect
                coin.y += Math.sin(Date.now() * 0.005 + coin.x * 0.01) * 0.5;
            }
        });
        
        // Remove collected coins and coins that are too far down
        this.coins = this.coins.filter(coin => 
            !coin.collected && coin.y < this.camera.y + this.canvas.height + 200
        );
    }
    

    
    checkCoinCollisions() {
        this.coins.forEach(coin => {
            if (!coin.collected) {
                // Check collision with player
                if (this.player.x < coin.x + coin.width &&
                    this.player.x + this.player.width > coin.x &&
                    this.player.y < coin.y + coin.height &&
                    this.player.y + this.player.height > coin.y) {
                    
                    // Collect coin
                    coin.collected = true;
                    this.coinsCollected++;
                    
                    // Add coin particles
                    this.createCoinParticles(coin.x + coin.width/2, coin.y + coin.height/2);
                }
            }
        });
    }
    
    updateGameSpeed() {
        // Increase speed based on score
        const baseSpeed = 1;
        const speedIncrease = Math.floor(this.score / 100) * 0.1; // +0.1 speed every 100 points
        this.speedMultiplier = Math.min(baseSpeed + speedIncrease, 2.0); // Cap at 2.0x speed
        
        // Apply speed to gravity and jump force
        this.gravity = 0.8 * this.speedMultiplier;
        this.jumpForce = -15 * this.speedMultiplier;
    }
    
    getCurrentBackground() {
        // Cycle through backgrounds based on score (like Chrome dinosaur game)
        // Every 300 points = new background phase
        const backgroundPhase = Math.floor(this.score / 300) % 3;
        
        switch (backgroundPhase) {
            case 0: return 'bg'; // Default space background
            case 1: return 'space2'; // Second space background
            case 2: return 'space3'; // Third space background
            default: return 'bg';
        }
    }
    
    updateCamera() {
        const targetY = this.player.y - this.canvas.height * 0.6;
        if (targetY < this.camera.y) {
            this.camera.y = targetY;
        }
    }
    
    checkCollisions() {
        this.player.onGround = false;
        
        this.platforms.forEach(platform => {
            if (platform.broken && platform.breakTimer > 0) return;
            
            // Check collision
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y < platform.y + platform.height &&
                this.player.y + this.player.height > platform.y) {
                
                // Only bounce if falling down and player is above the platform
                if (this.player.velocityY > 0 && 
                    this.player.y < platform.y) {
                    
                    this.player.velocityY = this.jumpForce;
                    this.player.y = platform.y - this.player.height;
                    this.player.onGround = true;
                    
                    // Play jump sound
                    this.playJumpSound();
                    
                    // Create jump particles
                    this.createJumpParticles(platform.x + platform.width/2, platform.y);
                    
                    // Handle breakable platforms
                    if (platform.type === 'breakable') {
                        platform.broken = true;
                        platform.breakTimer = 1;
                        // Create break particles
                        this.createBreakParticles(platform.x + platform.width/2, platform.y);
                    }
                }
            }
        });
    }
    
    updateScore() {
        // Score is only based on coins collected
        const newScore = this.coinsCollected * 20;
        
        // Play coin sound only when score actually increases
        if (newScore > this.score) {
            this.playCoinSound();
        }
        
        this.score = newScore;
        this.scoreElement.textContent = this.score;
    }
    
    checkGameOver() {
        if (this.player.y > this.camera.y + this.canvas.height + 100) {
            this.gameState = 'gameOver';
            this.finalScoreElement.textContent = this.score;
            this.gameOverElement.style.display = 'block';
        }
    }
    
    updateParticles() {
        // Update and remove old particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.2; // gravity
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
    }
    
    createJumpParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 60,
                y: y,
                velocityX: (Math.random() - 0.5) * 6,
                velocityY: Math.random() * -8 - 2,
                life: 30,
                maxLife: 30,
                alpha: 1,
                color: 'rgba(0, 255, 255, 1)',
                size: Math.random() * 4 + 2
            });
        }
    }
    
    createBreakParticles(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 80,
                y: y,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: Math.random() * -6 - 1,
                life: 40,
                maxLife: 40,
                alpha: 1,
                color: 'rgba(255, 100, 100, 1)',
                size: Math.random() * 3 + 1
            });
        }
    }
    
    createCoinParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y,
                velocityX: (Math.random() - 0.5) * 6,
                velocityY: Math.random() * -8 - 2,
                life: 35,
                maxLife: 35,
                alpha: 1,
                color: 'rgba(255, 215, 0, 1)', // Gold color
                size: Math.random() * 4 + 2
            });
        }
    }
    

    
    generateMorePlatforms() {
        // Get the highest (lowest Y value) platform
        const highestPlatform = Math.min(...this.platforms.map(p => p.y));
        const playerY = this.player.y;
        
        // Generate more platforms when player gets close to the top
        if (playerY < highestPlatform + 2000) {
            const currentHighest = Math.min(...this.platforms.map(p => p.y));
            
            // Generate 15 new platforms above the current highest
            for (let i = 1; i <= 15; i++) {
                // Use consistent spacing just like initial generation
                const newY = currentHighest - (i * this.platformSpacing);
                
                // Randomize platform type based on height
                const types = ['normal', 'moving', 'breakable'];
                const colors = ['#6464ff', '#64ff64', '#ff6464'];
                const tileAssets = ['tilePurple', 'tileYellow', 'tileRed'];
                
                let type = 'normal';
                let color = '#6464ff';
                let asset = 'tilePurple';
                
                // Same platform type logic as initial generation
                if (i > 5) {
                    const rand = Math.random();
                    if (rand < 0.1) {
                        type = 'breakable';
                        color = '#ff6464';
                        asset = 'tileRed';
                    } else if (rand < 0.2) {
                        type = 'moving';
                        color = '#64ff64';
                        asset = 'tileYellow';
                    }
                }
                
                // Simple random positioning like initial generation
                const x = Math.random() * (this.canvas.width - 120);
                
                const platform = {
                    x: x,
                    y: newY,
                    width: 120,
                    height: 20,
                    type: type,
                    color: color,
                    asset: asset,
                    moveDirection: Math.random() < 0.5 ? -1 : 1,
                    moveSpeed: 1 + Math.random() * 1.2, // Consistent with initial generation
                    broken: false,
                    breakTimer: 0
                };
                
                this.platforms.push(platform);
                
                // Add coin on platform with 30% chance
                if (Math.random() < 0.3) {
                    this.createCoin(platform);
                }
            }
        }
    }
    

    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.renderBackground();
        
        if (this.gameState === 'playing') {
            this.renderPlatforms();
            this.renderCoins();
            this.renderPlayer();
            this.renderParticles();
        }
    }
    
    renderBackground() {
        // Get current background based on score
        const currentBgName = this.getCurrentBackground();
        const currentBg = this.assets[currentBgName];
        
        // Use dynamic background if available, otherwise fallback to gradient
        if (currentBg && currentBg.complete) {
            // Calculate background position for parallax effect
            const bgY = (this.camera.y * 0.3) % this.canvas.height;
            
            // Draw multiple background tiles for seamless scrolling
            const bgScale = Math.max(this.canvas.width / currentBg.width, this.canvas.height / currentBg.height);
            const scaledWidth = currentBg.width * bgScale;
            const scaledHeight = currentBg.height * bgScale;
            
            // Draw background tiles
            for (let y = -scaledHeight; y <= this.canvas.height + scaledHeight; y += scaledHeight) {
                this.ctx.drawImage(
                    currentBg,
                    (this.canvas.width - scaledWidth) / 2,
                    y + bgY,
                    scaledWidth,
                    scaledHeight
                );
            }
        } else {
            // Fallback gradient background
            const bgPattern = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            bgPattern.addColorStop(0, '#0f0f23');
            bgPattern.addColorStop(0.5, '#1a1a2e');
            bgPattern.addColorStop(1, '#16213e');
            
            this.ctx.fillStyle = bgPattern;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Add atmospheric particles and stars
        this.renderStars();
        this.renderFloatingParticles();
    }
    
    renderStars() {
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 150; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = ((i * 73) % (this.canvas.height * 3) + this.camera.y * 0.1) % (this.canvas.height * 3);
            const size = Math.max(0.5, Math.sin(Date.now() * 0.001 + i) * 1.5 + (i % 3) + 1);
            const alpha = Math.max(0.1, Math.min(1, Math.sin(Date.now() * 0.002 + i) * 0.3 + 0.7));
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    renderFloatingParticles() {
        // Floating dust particles
        this.ctx.fillStyle = 'rgba(200, 200, 255, 0.4)';
        for (let i = 0; i < 30; i++) {
            const x = (i * 67 + Date.now() * 0.01) % (this.canvas.width + 100);
            const y = ((i * 89 + this.camera.y * 0.02) % (this.canvas.height * 2));
            const size = Math.max(0.5, Math.sin(Date.now() * 0.003 + i) * 2 + 2);
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    renderPlatforms() {
        this.platforms.forEach(platform => {
            const screenY = platform.y - this.camera.y;
            
            if (screenY > -50 && screenY < this.canvas.height + 50) {
                this.ctx.save();
                
                // Apply breaking effect
                if (platform.broken && platform.breakTimer > 0) {
                    this.ctx.globalAlpha = Math.max(0, 1 - platform.breakTimer / 30);
                    // Add shake effect for breaking platforms
                    const shakeX = (Math.random() - 0.5) * 4;
                    const shakeY = (Math.random() - 0.5) * 4;
                    this.ctx.translate(shakeX, shakeY);
                }
                
                // Add glow effect for special platforms
                if (platform.type === 'moving') {
                    this.ctx.shadowColor = '#64ff64';
                    this.ctx.shadowBlur = 15;
                } else if (platform.type === 'breakable') {
                    this.ctx.shadowColor = '#ff6464';
                    this.ctx.shadowBlur = 10;
                }
                
                // Use asset if available, otherwise use enhanced colored rectangle
                if (this.assets[platform.asset] && this.assets[platform.asset].complete) {
                    this.ctx.drawImage(
                        this.assets[platform.asset],
                        platform.x, screenY,
                        platform.width, platform.height
                    );
                } else {
                    // Enhanced platform rendering
                    const gradient = this.ctx.createLinearGradient(
                        platform.x, screenY,
                        platform.x, screenY + platform.height
                    );
                    
                    if (platform.type === 'moving') {
                        gradient.addColorStop(0, '#88ff88');
                        gradient.addColorStop(1, '#44aa44');
                    } else if (platform.type === 'breakable') {
                        gradient.addColorStop(0, '#ff8888');
                        gradient.addColorStop(1, '#aa4444');
                    } else {
                        gradient.addColorStop(0, '#8888ff');
                        gradient.addColorStop(1, '#4444aa');
                    }
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(platform.x, screenY, platform.width, platform.height);
                    
                    // Add highlight
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect(platform.x, screenY, platform.width, 3);
                    
                    // Add border
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(platform.x, screenY, platform.width, platform.height);
                }
                
                this.ctx.restore();
            }
        });
    }
    
    renderCoins() {
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const screenY = coin.y - this.camera.y;
                
                if (screenY > -50 && screenY < this.canvas.height + 50) {
                    this.ctx.save();
                    
                    // Disable image smoothing for crisp pixel art
                    this.ctx.imageSmoothingEnabled = false;
                    
                    if (this.assets.coin && this.assets.coin.complete) {
                        const frameWidth = 124; // 496px / 4 frames = 124px per frame
                        const frameHeight = 124;
                        const sourceX = coin.frame * frameWidth;
                        
                        // Add glow effect
                        this.ctx.shadowColor = '#FFD700';
                        this.ctx.shadowBlur = 10;
                        
                        this.ctx.drawImage(
                            this.assets.coin,
                            sourceX, 0,
                            frameWidth, frameHeight,
                            coin.x, screenY,
                            coin.width, coin.height
                        );
                    } else {
                        // Fallback: simple gold circle
                        this.ctx.fillStyle = '#FFD700';
                        this.ctx.shadowColor = '#FFD700';
                        this.ctx.shadowBlur = 8;
                        this.ctx.beginPath();
                        this.ctx.arc(coin.x + coin.width/2, screenY + coin.height/2, coin.width/2, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    
                    this.ctx.restore();
                }
            }
        });
    }
    

    
    renderPlayer() {
        if (!this.player) {
            return;
        }
        
        const screenY = this.player.y - this.camera.y;
        
        this.ctx.save();
        
        // Disable image smoothing for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;
        
        // Draw astronaut sprite cleanly without effects that cause distortion
        if (this.assets.astronaut && this.assets.astronaut.complete) {
            const frameWidth = 238; // 952px / 4 frames = 238px per frame
            const frameHeight = 238;
            const sourceX = this.player.frame * frameWidth;
            
            // Clean rendering without rotation or effects
            const offsetX = this.player.x;
            const offsetY = screenY;
            
            // Apply direction flipping only
            if (this.player.direction === -1) {
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(
                    this.assets.astronaut,
                    sourceX, 0,
                    frameWidth, frameHeight,
                    -(offsetX + this.player.width), offsetY,
                    this.player.width, this.player.height
                );
            } else {
                this.ctx.drawImage(
                    this.assets.astronaut,
                    sourceX, 0,
                    frameWidth, frameHeight,
                    offsetX, offsetY,
                    this.player.width, this.player.height
                );
            }
            
        } else {
            // Simple fallback
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(this.player.x, screenY, this.player.width, this.player.height);
        }
        
        this.ctx.restore();
    }
    
    renderParticles() {
        // Render game particles (jump/break effects)
        this.particles.forEach(particle => {
            const screenY = particle.y - this.camera.y;
            const size = Math.max(0.5, particle.size); // Ensure positive radius
            
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, Math.min(1, particle.alpha));
            
            // Parse color and apply alpha
            const colorMatch = particle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
            if (colorMatch) {
                const [, r, g, b] = colorMatch;
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.alpha})`;
            } else {
                this.ctx.fillStyle = particle.color;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, screenY, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    gameLoop() {
        this.frameCount++;
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new SpaceJumpGame();
});
