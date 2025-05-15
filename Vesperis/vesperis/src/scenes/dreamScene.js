import { createPlayer } from "../characters/player.js";
import { createEnemyAI } from "../systems/enemyAI.js";
import { ScoringSystem } from "../systems/scoring.js";
import { GameState } from "../systems/gameState.js";

export async function createDreamScene(engine, canvas, game) {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.02, 0.02, 0.1);

    const gameState = new GameState();

    setupAtmosphere(scene);
    setupLighting(scene);
    const environment = createEnvironment(scene);

    const player = createPlayer(scene, canvas);

    const fragments = createDreamFragments(scene, gameState);

    const exitPortal = createExitPortal(scene, gameState);

    const enemy = createEnemyAI(scene, player.mesh, gameState);

    const ui = createGameUI(scene, gameState, game);

    const scoring = new ScoringSystem(gameState);

    setupGameLoop(scene, engine, gameState, player, fragments, exitPortal, enemy, ui, scoring);

    return scene;
}

function setupAtmosphere(scene) {
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.015;
    scene.fogColor = new BABYLON.Color3(0.1, 0.05, 0.1);
}

function setupLighting(scene) {
    const ambientLight = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.4;
    ambientLight.diffuse = new BABYLON.Color3(0.6, 0.6, 0.8);

    
    const mainLight = new BABYLON.SpotLight("mainLight", 
        new BABYLON.Vector3(0, 8, 0),
        new BABYLON.Vector3(0, -1, 0),
        Math.PI / 3, 1, scene);
    mainLight.intensity = 1.2;
    mainLight.diffuse = new BABYLON.Color3(1, 0.9, 0.8);
    mainLight.range = 30;

    
    const cornerLights = [
        { pos: [-20, 6, -20], target: [-20, 0, -20] },
        { pos: [20, 6, -20], target: [20, 0, -20] },
        { pos: [-20, 6, 20], target: [-20, 0, 20] },
        { pos: [20, 6, 20], target: [20, 0, 20] }
    ];

    cornerLights.forEach((lightData, index) => {
        const light = new BABYLON.SpotLight(`cornerLight${index}`, 
            new BABYLON.Vector3(...lightData.pos),
            new BABYLON.Vector3(...lightData.target).subtract(new BABYLON.Vector3(...lightData.pos)).normalize(),
            Math.PI / 4, 1, scene);
        light.intensity = 0.8;
        light.diffuse = new BABYLON.Color3(0.8, 0.9, 1);
        light.range = 25;
    });

    const pathLights = [];
    const pathPositions = [
        [0, 3, 0], [8, 3, 8], [-8, 3, -8], [12, 3, -5], [-12, 3, 5],
        [5, 3, 15], [-5, 3, -15], [15, 3, 0], [-15, 3, 0]
    ];

    pathPositions.forEach((pos, index) => {
        const light = new BABYLON.PointLight(`pathLight${index}`, 
            new BABYLON.Vector3(...pos), scene);
        light.intensity = 0.6;
        light.diffuse = new BABYLON.Color3(0.9, 0.7, 0.5);
        light.range = 8;
        pathLights.push(light);

        const fixture = BABYLON.MeshBuilder.CreateCylinder(`fixture${index}`, {
            height: 0.5, diameter: 0.8
        }, scene);
        fixture.position = new BABYLON.Vector3(...pos);
        const fixtureMat = new BABYLON.StandardMaterial(`fixtureMat${index}`, scene);
        fixtureMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        fixtureMat.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0.1);
        fixture.material = fixtureMat;
    });

    const fragmentLights = [];
    const fragmentPositions = [
        [5, 2, 5], [-5, 2, -5], [12, 2, 8], [-12, 2, -8],
        [20, 2, 15], [-20, 2, -15], [-15, 4, 15], [18, 5, -12]
    ];

    fragmentPositions.forEach((pos, index) => {
        const light = new BABYLON.PointLight(`fragmentLight${index}`, 
            new BABYLON.Vector3(...pos), scene);
        light.intensity = 0.4;
        light.diffuse = new BABYLON.Color3(1, 1, 0.8);
        light.range = 4;
        fragmentLights.push(light);
    });

    scene.registerBeforeRender(() => {
        pathLights.forEach((light, index) => {
            if (Math.random() < 0.05) {
                light.intensity = 0.3 + Math.random() * 0.5;
            }
        });

   
        fragmentLights.forEach((light, index) => {
            const pulse = Math.sin(Date.now() * 0.003 + index) * 0.2;
            light.intensity = 0.4 + pulse;
        });
    });
}

function createEnvironment(scene) {
    
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.15, 0.2);
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const groundTexture = new BABYLON.StandardMaterial("groundTexture", scene);
    groundTexture.diffuseColor = new BABYLON.Color3(0.15, 0.1, 0.15);
    groundTexture.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.1);
    ground.material = groundTexture;

    createMazeWalls(scene);

    createPlatforms(scene);

    createDecorations(scene);

    return { ground };
}

function createDecorations(scene) {

    const pillarPositions = [
        [-10, 0, -20], [10, 0, -20], [-10, 0, 20], [10, 0, 20],
        [-20, 0, -10], [20, 0, -10], [-20, 0, 10], [20, 0, 10]
    ];

    pillarPositions.forEach((pos, index) => {
        const pillar = BABYLON.MeshBuilder.CreateCylinder(`pillar${index}`, {
            height: 5, diameterTop: 0.8, diameterBottom: 1.2
        }, scene);
        pillar.position = new BABYLON.Vector3(...pos);
        
        const pillarMat = new BABYLON.StandardMaterial(`pillarMat${index}`, scene);
        pillarMat.diffuseColor = new BABYLON.Color3(0.25, 0.2, 0.3);
        pillarMat.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0.15);
        pillar.material = pillarMat;

        const rune = BABYLON.MeshBuilder.CreatePlane(`rune${index}`, { size: 0.5 }, scene);
        rune.position = new BABYLON.Vector3(pos[0], 2.5, pos[2] > 0 ? pos[2] - 0.6 : pos[2] + 0.6);
        rune.lookAt(new BABYLON.Vector3(0, 2.5, 0));
        
        const runeMat = new BABYLON.StandardMaterial(`runeMat${index}`, scene);
        runeMat.emissiveColor = new BABYLON.Color3(0.3, 0.7, 1);
        runeMat.alpha = 0.8;
        rune.material = runeMat;

        scene.registerBeforeRender(() => {
            const pulse = Math.sin(Date.now() * 0.002 + index) * 0.3;
            runeMat.emissiveColor = new BABYLON.Color3(0.3 + pulse, 0.7, 1);
        });
    });

    for (let i = 0; i < 8; i++) {
        const crystal = BABYLON.MeshBuilder.CreatePolyhedron(`crystal${i}`, { type: 1, size: 0.3 }, scene);
        crystal.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 40,
            2 + Math.random() * 3,
            (Math.random() - 0.5) * 40
        );
        
        const crystalMat = new BABYLON.StandardMaterial(`crystalMat${i}`, scene);
        crystalMat.emissiveColor = new BABYLON.Color3(0.5, 0.3, 0.8);
        crystalMat.alpha = 0.7;
        crystal.material = crystalMat;

        scene.registerBeforeRender(() => {
            crystal.rotation.y += 0.01;
            crystal.rotation.x += 0.005;
            crystal.position.y += Math.sin(Date.now() * 0.001 + i) * 0.005;
        });
    }

    const torchPositions = [
        [0, 2, 24.5], [0, 2, -24.5], [24.5, 2, 0], [-24.5, 2, 0],
        [12, 2, 24.5], [-12, 2, -24.5]
    ];

    torchPositions.forEach((pos, index) => {
        const torch = BABYLON.MeshBuilder.CreateCylinder(`torch${index}`, {
            height: 1.5, diameter: 0.2
        }, scene);
        torch.position = new BABYLON.Vector3(...pos);
        
        const torchMat = new BABYLON.StandardMaterial(`torchMat${index}`, scene);
        torchMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
        torch.material = torchMat;

        const flame = BABYLON.MeshBuilder.CreateSphere(`flame${index}`, { diameter: 0.4 }, scene);
        flame.position = new BABYLON.Vector3(pos[0], pos[1] + 0.8, pos[2]);
        
        const flameMat = new BABYLON.StandardMaterial(`flameMat${index}`, scene);
        flameMat.emissiveColor = new BABYLON.Color3(1, 0.5, 0.1);
        flameMat.alpha = 0.8;
        flame.material = flameMat;

        
        scene.registerBeforeRender(() => {
            const flicker = Math.sin(Date.now() * 0.01 + index) * 0.3;
            flameMat.emissiveColor = new BABYLON.Color3(1, 0.5 + flicker, 0.1);
            flame.scaling.y = 1 + flicker * 0.5;
        });
    });
}


function createMazeWalls(scene) {
    const wallHeight = 4;
    const wallThickness = 0.3;
    const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    wallMat.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.1);

    
    const walls = [
        
        { pos: [0, wallHeight/2, 25], size: [50, wallHeight, wallThickness] },
        { pos: [0, wallHeight/2, -25], size: [50, wallHeight, wallThickness] },
        { pos: [25, wallHeight/2, 0], size: [wallThickness, wallHeight, 50] },
        { pos: [-25, wallHeight/2, 0], size: [wallThickness, wallHeight, 50] },
        
        
        { pos: [10, wallHeight/2, 10], size: [15, wallHeight, wallThickness] },
        { pos: [-10, wallHeight/2, -10], size: [15, wallHeight, wallThickness] },
        { pos: [0, wallHeight/2, 15], size: [wallThickness, wallHeight, 10] },
        { pos: [-15, wallHeight/2, 5], size: [wallThickness, wallHeight, 20] },
        { pos: [15, wallHeight/2, -5], size: [wallThickness, wallHeight, 20] },
        { pos: [5, wallHeight/2, -15], size: [10, wallHeight, wallThickness] },
        { pos: [-5, wallHeight/2, 5], size: [10, wallHeight, wallThickness] },
    ];

    walls.forEach((wallData, index) => {
        const wall = BABYLON.MeshBuilder.CreateBox(`wall${index}`, {
            width: wallData.size[0],
            height: wallData.size[1],
            depth: wallData.size[2]
        }, scene);
        wall.position = new BABYLON.Vector3(...wallData.pos);
        wall.material = wallMat;
    });
}


function createPlatforms(scene) {
    const platformMat = new BABYLON.StandardMaterial("platformMat", scene);
    platformMat.diffuseColor = new BABYLON.Color3(0.2, 0.15, 0.2);
    platformMat.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0.1);

    
    const platforms = [
        { pos: [-15, 2, 15], size: [4, 0.5, 4] },
        { pos: [18, 3, -12], size: [3, 0.5, 3] },
        { pos: [-8, 2.5, -18], size: [3.5, 0.5, 3.5] },
        { pos: [12, 2, 20], size: [3, 0.5, 3] },
    ];

    platforms.forEach((platformData, index) => {
        const platform = BABYLON.MeshBuilder.CreateBox(`platform${index}`, {
            width: platformData.size[0],
            height: platformData.size[1],
            depth: platformData.size[2]
        }, scene);
        platform.position = new BABYLON.Vector3(...platformData.pos);
        platform.material = platformMat;
    });
}


function createDreamFragments(scene, gameState) {
    const fragments = [];
    
    
    const positions = [
        [5, 1, 5], [-5, 1, -5], [12, 1, 8], [-12, 1, -8],
        [20, 1, 15], [-20, 1, -15], 
        [-15, 3, 15], 
        [18, 4, -12], 
    ];

    positions.forEach((pos, index) => {
        const fragment = BABYLON.MeshBuilder.CreateSphere(`fragment${index}`, { diameter: 0.8 }, scene);
        fragment.position = new BABYLON.Vector3(...pos);
        
        const fragmentMat = new BABYLON.StandardMaterial(`fragmentMat${index}`, scene);
        fragmentMat.emissiveColor = new BABYLON.Color3(1, 1, 0.8);
        fragmentMat.disableLighting = true;
        fragment.material = fragmentMat;
        
        
        scene.registerBeforeRender(() => {
            fragment.rotation.y += 0.03;
            fragment.position.y = pos[1] + Math.sin(Date.now() * 0.002 + index) * 0.2;
            
            
            const pulse = Math.sin(Date.now() * 0.005 + index) * 0.3;
            fragmentMat.emissiveColor = new BABYLON.Color3(
                0.8 + pulse,
                0.8 + pulse,
                0.6 + pulse * 0.5
            );
        });

        fragments.push({ mesh: fragment, collected: false, originalPos: pos });
    });

    return fragments;
}

function createExitPortal(scene, gameState) {
    const portal = BABYLON.MeshBuilder.CreateDisc("exitPortal", { radius: 2.5 }, scene);
    portal.position = new BABYLON.Vector3(22, 1, 22); 
    portal.rotation.x = -Math.PI / 2; 
    
    const portalMat = new BABYLON.StandardMaterial("portalMat", scene);
    portalMat.emissiveColor = new BABYLON.Color3(0.1, 1, 0.5);
    portalMat.alpha = 0.7;
    portalMat.disableLighting = true;
    portal.material = portalMat;

    
    scene.registerBeforeRender(() => {
        if (gameState.fragmentsCollected >= gameState.totalFragments) {
            portal.rotation.z += 0.02;
            
            const pulse = Math.sin(Date.now() * 0.005) * 0.3;
            portalMat.emissiveColor = new BABYLON.Color3(0.2, 0.7 + pulse, 0.5 + pulse);
            portalMat.alpha = 0.8 + pulse * 0.2;
        } else {
            
            portalMat.emissiveColor = new BABYLON.Color3(0.05, 0.3, 0.15);
            portalMat.alpha = 0.3;
        }
    });

    return portal;
}


function createGameUI(scene, gameState, game) {
    const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("gameUI");
    
    
    const scorePanel = new BABYLON.GUI.Rectangle();
    scorePanel.width = 0.2;
    scorePanel.height = "120px";
    scorePanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    scorePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    scorePanel.left = "10px";
    scorePanel.top = "10px";
    scorePanel.background = "rgba(0, 0, 0, 0.7)";
    scorePanel.cornerRadius = 10;
    ui.addControl(scorePanel);

    const scoreText = new BABYLON.GUI.TextBlock();
    scoreText.text = `Score: ${gameState.score}`;
    scoreText.color = "#FFD700";
    scoreText.fontSize = 18;
    scoreText.fontWeight = "bold";
    scoreText.top = "-15px";
    scorePanel.addControl(scoreText);

    const fragmentsText = new BABYLON.GUI.TextBlock();
    fragmentsText.text = `Fragments: ${gameState.fragmentsCollected}/${gameState.totalFragments}`;
    fragmentsText.color = "#87CEEB";
    fragmentsText.fontSize = 16;
    fragmentsText.top = "15px";
    scorePanel.addControl(fragmentsText);

    
    const timerPanel = new BABYLON.GUI.Rectangle();
    timerPanel.width = 0.15;
    timerPanel.height = "60px";
    timerPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    timerPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    timerPanel.left = "-10px";
    timerPanel.top = "10px";
    timerPanel.background = "rgba(0, 0, 0, 0.7)";
    timerPanel.cornerRadius = 10;
    ui.addControl(timerPanel);

    const timerText = new BABYLON.GUI.TextBlock();
    timerText.text = `Time: ${gameState.timeLeft}s`;
    timerText.color = "#FF6B6B";
    timerText.fontSize = 18;
    timerText.fontWeight = "bold";
    timerPanel.addControl(timerText);

    
    const gameOverScreen = new BABYLON.GUI.Rectangle();
    gameOverScreen.width = 0.6;
    gameOverScreen.height = 0.5;
    gameOverScreen.background = "rgba(0, 0, 0, 0.9)";
    gameOverScreen.cornerRadius = 20;
    gameOverScreen.isVisible = false;
    ui.addControl(gameOverScreen);

    const gameOverTitle = new BABYLON.GUI.TextBlock();
    gameOverTitle.fontSize = 48;
    gameOverTitle.fontWeight = "bold";
    gameOverTitle.top = "-100px";
    gameOverScreen.addControl(gameOverTitle);

    const gameOverText = new BABYLON.GUI.TextBlock();
    gameOverText.fontSize = 20;
    gameOverText.top = "-20px";
    gameOverScreen.addControl(gameOverText);

    const finalScoreText = new BABYLON.GUI.TextBlock();
    finalScoreText.fontSize = 24;
    finalScoreText.color = "#FFD700";
    finalScoreText.top = "40px";
    gameOverScreen.addControl(finalScoreText);

    const restartButton = BABYLON.GUI.Button.CreateSimpleButton("restartButton", "Play Again");
    restartButton.widthInPixels = 200;
    restartButton.heightInPixels = 50;
    restartButton.color = "white";
    restartButton.background = "#4A0E4E";
    restartButton.top = "100px";
    restartButton.cornerRadius = 10;
    restartButton.onPointerClickObservable.add(() => {
        location.reload();
    });
    gameOverScreen.addControl(restartButton);

    return {
        scoreText,
        fragmentsText,
        timerText,
        timerPanel,
        gameOverScreen,
        gameOverTitle,
        gameOverText,
        finalScoreText
    };
}


function setupGameLoop(scene, engine, gameState, player, fragments, exitPortal, enemy, ui, scoring) {
    let gameTimer = 0;
    
    scene.registerBeforeRender(() => {
        if (!gameState.gameRunning) return;

        const deltaTime = engine.getDeltaTime() / 1000;
        gameTimer += deltaTime;

        
        if (gameTimer >= 1.0) {
            gameState.timeLeft = Math.max(0, gameState.timeLeft - 1);
            gameTimer = 0;
        }

        
        ui.scoreText.text = `Score: ${gameState.score}`;
        ui.fragmentsText.text = `Fragments: ${gameState.fragmentsCollected}/${gameState.totalFragments}`;
        ui.timerText.text = `Time: ${gameState.timeLeft}s`;

        
        if (gameState.timeLeft <= 10) {
            ui.timerText.color = "#FF0000";
            ui.timerPanel.background = "rgba(255, 0, 0, 0.2)";
        } else if (gameState.timeLeft <= 30) {
            ui.timerText.color = "#FFA500";
        }

        
        if (gameState.timeLeft <= 0 && !gameState.gameWon) {
            endGame(false, "Time's Up!", "You fell asleep... Freddy got you in your dreams!");
        }

        if (gameState.gameLost) {
            endGame(false, "GAME OVER", "Freddy Krueger caught you!\n\n'Welcome to my nightmare!'");
        }

        if (gameState.gameWon) {
            const timeBonus = gameState.timeLeft * 10;
            gameState.score += timeBonus;
            endGame(true, "You Survived!", `You escaped Freddy's nightmare!\nTime Bonus: +${timeBonus}\n\n'You think you're awake... but you're not!'`);
        }

        
        checkFragmentCollision(player.mesh, fragments, gameState, scoring);
        
        
        checkExitPortal(player.mesh, exitPortal, gameState);
    });

    function endGame(won, title, message) {
        gameState.gameRunning = false;
        
        ui.gameOverTitle.text = title;
        ui.gameOverTitle.color = won ? "#00FF00" : "#FF0000";
        ui.gameOverText.text = message;
        ui.gameOverText.color = "white";
        ui.finalScoreText.text = `Final Score: ${gameState.score}`;
        
        ui.gameOverScreen.isVisible = true;
        
        
        player.dispose();
    }
}


function checkFragmentCollision(playerMesh, fragments, gameState, scoring) {
    fragments.forEach((fragment, index) => {
        if (!fragment.collected) {
            const distance = BABYLON.Vector3.Distance(playerMesh.position, fragment.mesh.position);
            if (distance < 1.5) {
                fragment.collected = true;
                fragment.mesh.dispose();
                gameState.fragmentsCollected++;
                scoring.addScore(100, "Dream Fragment");
                
                
                console.log(`Fragment ${index + 1} collected!`);
            }
        }
    });
}

function checkExitPortal(playerMesh, exitPortal, gameState) {
    if (gameState.fragmentsCollected >= gameState.totalFragments) {
        const distance = BABYLON.Vector3.Distance(playerMesh.position, exitPortal.position);
        if (distance < 3) {
            gameState.gameWon = true;
        }
    }
}