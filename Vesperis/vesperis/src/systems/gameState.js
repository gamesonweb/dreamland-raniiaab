export class GameState {
    constructor() {
        this.score = 0;
        this.timeLeft = 90; 
        this.fragmentsCollected = 0;
        this.totalFragments = 8;
        this.gameRunning = true;
        this.gameWon = false;
        this.gameLost = false;
        
        
        this.playerCaught = false;
        this.playerRespawnTime = 0;
        
        
        this.enemySpeed = 1.0;
        this.enemyAggressiveness = 1.0;
        
        
        this.eventCallbacks = {};
    }

    
    addScore(points, reason = "") {
        this.score += points;
        this.triggerEvent('scoreChanged', { newScore: this.score, points, reason });
    }

    subtractScore(points, reason = "") {
        this.score = Math.max(0, this.score - points);
        this.triggerEvent('scoreChanged', { newScore: this.score, points: -points, reason });
    }

    
    collectFragment() {
        this.fragmentsCollected++;
        this.addScore(100, "Dream Fragment");
        this.triggerEvent('fragmentCollected', { 
            collected: this.fragmentsCollected, 
            total: this.totalFragments 
        });
        
        
        if (this.fragmentsCollected >= this.totalFragments) {
            this.triggerEvent('allFragmentsCollected');
        }
    }

    
    updateTime(deltaSeconds) {
        if (this.gameRunning) {
            this.timeLeft = Math.max(0, this.timeLeft - deltaSeconds);
            this.triggerEvent('timeUpdated', { timeLeft: this.timeLeft });
            
            
            if (this.timeLeft <= 30) {
                this.enemySpeed = 1.0 + (30 - this.timeLeft) / 30 * 0.5; 
                this.enemyAggressiveness = 1.0 + (30 - this.timeLeft) / 30 * 0.3;
            }
            
            
            if (this.timeLeft <= 0 && !this.gameWon) {
                this.gameLost = true;
                this.gameRunning = false;
                this.triggerEvent('timeUp');
            }
        }
    }

    
    playerCaughtByEnemy() {
        this.playerCaught = true;
        this.gameLost = true;
        this.gameRunning = false;
        
        
        this.triggerEvent('playerDied', { reason: 'Caught by Freddy Krueger' });
        
        
        
        console.log("GAME OVER: Freddy Krueger got you!");
    }

    
    updatePlayerRespawn(deltaSeconds) {
        if (this.playerCaught && this.playerRespawnTime > 0) {
            this.playerRespawnTime -= deltaSeconds;
            if (this.playerRespawnTime <= 0) {
                this.playerCaught = false;
                this.triggerEvent('playerRespawned');
            }
        }
    }

    
    winGame() {
        if (this.gameRunning) {
            this.gameWon = true;
            this.gameRunning = false;
            
            
            const timeBonus = this.timeLeft * 10;
            this.addScore(timeBonus, "Time Bonus");
            
            this.triggerEvent('gameWon', { timeBonus });
        }
    }

    loseGame(reason = "Game Over") {
        if (this.gameRunning) {
            this.gameLost = true;
            this.gameRunning = false;
            this.triggerEvent('gameLost', { reason });
        }
    }

    
    addEventListener(eventName, callback) {
        if (!this.eventCallbacks[eventName]) {
            this.eventCallbacks[eventName] = [];
        }
        this.eventCallbacks[eventName].push(callback);
    }

    removeEventListener(eventName, callback) {
        if (this.eventCallbacks[eventName]) {
            const index = this.eventCallbacks[eventName].indexOf(callback);
            if (index > -1) {
                this.eventCallbacks[eventName].splice(index, 1);
            }
        }
    }

    triggerEvent(eventName, data = {}) {
        if (this.eventCallbacks[eventName]) {
            this.eventCallbacks[eventName].forEach(callback => {
                callback(data);
            });
        }
    }

    
    getProgress() {
        return {
            fragments: (this.fragmentsCollected / this.totalFragments) * 100,
            time: (this.timeLeft / 90) * 100
        };
    }

    
    canExitLevel() {
        return this.fragmentsCollected >= this.totalFragments;
    }

    
    getStatus() {
        if (this.gameWon) return 'won';
        if (this.gameLost) return 'lost';
        if (this.playerCaught) return 'caught';
        return 'playing';
    }

    
    reset() {
        this.score = 0;
        this.timeLeft = 90;
        this.fragmentsCollected = 0;
        this.gameRunning = true;
        this.gameWon = false;
        this.gameLost = false;
        this.playerCaught = false;
        this.playerRespawnTime = 0;
        this.enemySpeed = 1.0;
        this.enemyAggressiveness = 1.0;
        this.triggerEvent('gameReset');
    }
}