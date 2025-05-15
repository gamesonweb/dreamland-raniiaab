
import { createMenuScene } from "./scenes/menuScene.js";
import { createDreamScene } from "./scenes/dreamScene.js";

class VesperisGame {
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.currentScene = null;
        this.gameStarted = false;
        this.loaded = false;
    }

    async init() {
        try {
            console.log("Initializing game...");
            
            
            this.showLoadingScreen();
            
            
            if (typeof BABYLON === 'undefined') {
                throw new Error('BABYLON.js not loaded');
            }
            
            if (typeof BABYLON.GUI === 'undefined') {
                throw new Error('BABYLON.GUI not loaded');
            }
            
            console.log("Babylon.js loaded successfully");
            
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            
            console.log("Creating menu scene...");
            this.currentScene = await createMenuScene(this.engine, this.canvas, this);
            
            
            this.engine.runRenderLoop(() => {
                if (this.currentScene) {
                    this.currentScene.render();
                }
            });

            
            window.addEventListener("resize", () => {
                this.engine.resize();
            });

            
            window.switchScene = (newScene) => {
                if (this.currentScene) {
                    this.currentScene.dispose();
                }
                this.currentScene = newScene;
            };
            
            console.log("Game initialized successfully!");
            
            
            this.hideLoadingScreen();
            this.showStartScreen();
            
            this.loaded = true;
            
        } catch (error) {
            console.error("Failed to initialize game:", error);
            this.showErrorScreen(error);
        }
    }

    showLoadingScreen() {
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) {
            loadingDiv.innerHTML = `
                <div style="text-align: center;">
                    <h2>🌙 Loading Vesperis... 🌙</h2>
                    <p>Preparing the nightmare realm...</p>
                    <div style="border: 2px solid #555; border-top: 2px solid #fff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto;"></div>
                    <p style="font-size: 12px; color: #888;">Loading 3D engine...</p>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            loadingDiv.style.display = 'block';
        }
    }

    hideLoadingScreen() {
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    showStartScreen() {
        const startScreenDiv = document.createElement('div');
        startScreenDiv.id = 'startScreen';
        startScreenDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.9);
            padding: 40px;
            border-radius: 20px;
            border: 2px solid #444;
        `;
        
        startScreenDiv.innerHTML = `
            <h1 style="color: #E6E6FA; font-size: 48px; margin-bottom: 20px; font-family: serif;">
                ✦ VESPERIS ✦
            </h1>
            <p style="color: #B0B0D0; font-size: 20px; margin-bottom: 30px; font-style: italic;">
                Dreamscape Escape
            </p>
            <button id="enterButton" style="
                background: #4A0E4E;
                color: white;
                border: none;
                padding: 15px 30px;
                font-size: 18px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                🌟 Click to Enter 🌟
            </button>
        `;
        
        document.body.appendChild(startScreenDiv);
        
        
        const enterButton = document.getElementById('enterButton');
        enterButton.addEventListener('mouseenter', () => {
            enterButton.style.background = '#6A1B9A';
            enterButton.style.transform = 'scale(1.05)';
        });
        
        enterButton.addEventListener('mouseleave', () => {
            enterButton.style.background = '#4A0E4E';
            enterButton.style.transform = 'scale(1)';
        });
        
        
        enterButton.addEventListener('click', () => {
            this.hideStartScreen();
            this.canvas.style.display = 'block';
            
            
            const instructions = document.getElementById('instructions');
            if (instructions) {
                instructions.style.display = 'block';
            }
            
            
            this.canvas.focus();
            this.canvas.click();
        });
    }

    hideStartScreen() {
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.remove();
        }
    }

    showErrorScreen(error) {
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) {
            loadingDiv.innerHTML = `
                <div style="text-align: center; color: #ff6b6b;">
                    <h2>❌ Error Loading Game ❌</h2>
                    <p>Failed to initialize Vesperis</p>
                    <p style="font-family: monospace; font-size: 12px; max-width: 400px; margin: 20px auto;">${error.message}</p>
                    <p style="font-size: 12px; color: #888;">Check console for more details</p>
                    <button onclick="location.reload()" style="
                        background: #ff6b6b;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 20px;
                    ">
                        Reload Page
                    </button>
                </div>
            `;
            loadingDiv.style.display = 'block';
        }
    }

    async startGame() {
        console.log("Starting Vesperis game...");
        this.gameStarted = true;
        
        try {
            const dreamScene = await createDreamScene(this.engine, this.canvas, this);
            window.switchScene(dreamScene);
        } catch (error) {
            console.error("Failed to start game:", error);
            alert("Error starting game: " + error.message);
        }
    }
}


window.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM loaded, initializing game...");
    
    
    const canvas = document.getElementById("renderCanvas");
    if (canvas) {
        canvas.style.display = 'none';
    }
    
    const game = new VesperisGame();
    await game.init();
});