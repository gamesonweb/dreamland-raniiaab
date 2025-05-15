export class ScoringSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.scoreHistory = [];
        this.multiplier = 1.0;
        this.comboCount = 0;
        this.lastScoreTime = 0;
        this.comboTimeLimit = 3000; 
        
        
        this.scoreValues = {
            FRAGMENT: 100,
            TIME_BONUS_MULTIPLIER: 10,
            CAUGHT_PENALTY: -50,
            COMBO_BONUS: 25,
            SPEED_BONUS: 10, 
            PERFECT_RUN_BONUS: 500 
        };
        
        
        this.stats = {
            fragmentsCollected: 0,
            timesCaught: 0,
            fastestFragmentCollection: Infinity,
            averageFragmentTime: 0,
            totalFragmentTime: 0,
            perfectRun: true
        };
        
        this.fragmentCollectionTimes = [];
        this.lastFragmentTime = Date.now();
    }

    
    addScore(basePoints, reason = "", applyBonuses = true) {
        let totalPoints = basePoints;
        let bonusDetails = [];
        const currentTime = Date.now();

        
        totalPoints *= this.multiplier;

        if (applyBonuses) {
            
            if (reason === "Dream Fragment") {
                this.handleFragmentCollection(currentTime);
                
                
                const timeSinceLastFragment = currentTime - this.lastFragmentTime;
                if (timeSinceLastFragment < 5000 && this.stats.fragmentsCollected > 0) {
                    const speedBonus = Math.max(0, this.scoreValues.SPEED_BONUS * (5000 - timeSinceLastFragment) / 5000);
                    totalPoints += speedBonus;
                    bonusDetails.push(`Speed Bonus: +${Math.round(speedBonus)}`);
                }
                
                
                if (this.comboCount > 1) {
                    const comboBonus = this.scoreValues.COMBO_BONUS * (this.comboCount - 1);
                    totalPoints += comboBonus;
                    bonusDetails.push(`Combo x${this.comboCount}: +${comboBonus}`);
                }
                
                this.lastFragmentTime = currentTime;
            }
        }

        
        totalPoints = Math.round(totalPoints);

        
        const scoreEvent = {
            points: totalPoints,
            basePoints: basePoints,
            reason: reason,
            bonusDetails: bonusDetails,
            timestamp: currentTime,
            multiplier: this.multiplier,
            combo: this.comboCount
        };

        this.scoreHistory.push(scoreEvent);
        this.gameState.score += totalPoints;
        this.lastScoreTime = currentTime;

        
        this.gameState.triggerEvent('scoreAdded', scoreEvent);

        return totalPoints;
    }

    
    handleFragmentCollection(currentTime) {
        this.stats.fragmentsCollected++;
        
        
        if (currentTime - this.lastScoreTime < this.comboTimeLimit) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }

        
        if (this.stats.fragmentsCollected > 1) {
            const collectionTime = currentTime - this.lastFragmentTime;
            this.fragmentCollectionTimes.push(collectionTime);
            this.stats.totalFragmentTime += collectionTime;
            this.stats.fastestFragmentCollection = Math.min(this.stats.fastestFragmentCollection, collectionTime);
            this.stats.averageFragmentTime = this.stats.totalFragmentTime / this.fragmentCollectionTimes.length;
        }
    }

    
    subtractScore(points, reason = "") {
        const penalty = Math.abs(points);
        this.gameState.score = Math.max(0, this.gameState.score - penalty);
        
        
        const penaltyEvent = {
            points: -penalty,
            reason: reason,
            timestamp: Date.now()
        };
        
        this.scoreHistory.push(penaltyEvent);
        this.gameState.triggerEvent('scoreSubtracted', penaltyEvent);
        
        
        if (reason.includes("Caught")) {
            this.stats.timesCaught++;
            this.stats.perfectRun = false;
            this.comboCount = 0; 
        }
        
        return penalty;
    }

    
    calculateTimeBonus() {
        const timeBonus = this.gameState.timeLeft * this.scoreValues.TIME_BONUS_MULTIPLIER;
        return timeBonus;
    }

    
    calculatePerfectRunBonus() {
        if (this.stats.perfectRun && this.stats.timesCaught === 0) {
            return this.scoreValues.PERFECT_RUN_BONUS;
        }
        return 0;
    }

    
    getFinalScore() {
        let finalScore = this.gameState.score;
        
        
        const timeBonus = this.calculateTimeBonus();
        finalScore += timeBonus;
        
        
        const perfectBonus = this.calculatePerfectRunBonus();
        finalScore += perfectBonus;
        
        return {
            finalScore: finalScore,
            baseScore: this.gameState.score,
            timeBonus: timeBonus,
            perfectRunBonus: perfectBonus,
            fragmentsCollected: this.stats.fragmentsCollected,
            timesCaught: this.stats.timesCaught
        };
    }

    
    getPerformanceGrade() {
        const finalScore = this.getFinalScore().finalScore;
        const maxPossibleScore = (this.gameState.totalFragments * this.scoreValues.FRAGMENT) + 
                                (90 * this.scoreValues.TIME_BONUS_MULTIPLIER) + 
                                this.scoreValues.PERFECT_RUN_BONUS;
        
        const percentage = (finalScore / maxPossibleScore) * 100;
        
        if (percentage >= 90) return { grade: 'S', description: 'Perfect Nightmare Escape!' };
        if (percentage >= 80) return { grade: 'A', description: 'Excellent Escape!' };
        if (percentage >= 70) return { grade: 'B', description: 'Good Escape!' };
        if (percentage >= 60) return { grade: 'C', description: 'Decent Escape!' };
        if (percentage >= 50) return { grade: 'D', description: 'Barely Escaped!' };
        return { grade: 'F', description: 'Poor Performance!' };
    }

    
    getDetailedStats() {
        const performance = this.getPerformanceGrade();
        const finalScoreData = this.getFinalScore();
        
        return {
            ...finalScoreData,
            grade: performance.grade,
            gradeDescription: performance.description,
            averageFragmentTime: this.stats.averageFragmentTime / 1000, 
            fastestFragmentTime: this.stats.fastestFragmentCollection / 1000,
            maxCombo: Math.max(...this.scoreHistory.map(event => event.combo || 0)),
            totalScoreEvents: this.scoreHistory.length,
            efficiency: (this.stats.fragmentsCollected / this.gameState.totalFragments) * 100
        };
    }

    
    exportScoreHistory() {
        return {
            history: this.scoreHistory,
            stats: this.stats,
            gameState: {
                finalScore: this.gameState.score,
                timeLeft: this.gameState.timeLeft,
                fragmentsCollected: this.gameState.fragmentsCollected,
                gameWon: this.gameState.gameWon
            }
        };
    }

    
    reset() {
        this.scoreHistory = [];
        this.multiplier = 1.0;
        this.comboCount = 0;
        this.lastScoreTime = 0;
        this.stats = {
            fragmentsCollected: 0,
            timesCaught: 0,
            fastestFragmentCollection: Infinity,
            averageFragmentTime: 0,
            totalFragmentTime: 0,
            perfectRun: true
        };
        this.fragmentCollectionTimes = [];
        this.lastFragmentTime = Date.now();
    }
}