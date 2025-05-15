export async function createMenuScene(engine, canvas, game) {
    
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.15);

    
    const camera = new BABYLON.UniversalCamera("menuCamera", new BABYLON.Vector3(0, 0, 0), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 1));
    
    
    

    
    const light = new BABYLON.HemisphericLight("menuLight", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.5;

    
    for (let i = 0; i < 50; i++) {
        const star = BABYLON.MeshBuilder.CreateSphere(`star${i}`, { diameter: 0.02 }, scene);
        star.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            Math.random() * 50 + 10
        );
        
        const starMat = new BABYLON.StandardMaterial(`starMat${i}`, scene);
        starMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        star.material = starMat;
    }

    
    const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("menuUI");
    
    
    const backgroundPanel = new BABYLON.GUI.Rectangle();
    backgroundPanel.widthInPixels = 800;
    backgroundPanel.heightInPixels = 600;
    backgroundPanel.background = "rgba(0, 0, 0, 0.8)";
    backgroundPanel.cornerRadius = 20;
    backgroundPanel.thickness = 2;
    backgroundPanel.color = "#444";
    ui.addControl(backgroundPanel);

    
    const title = new BABYLON.GUI.TextBlock();
    title.text = "✦ VESPERIS ✦";
    title.color = "#E6E6FA";
    title.fontSize = 64;
    title.fontFamily = "Arial, serif";
    title.fontWeight = "bold";
    title.top = "-200px";
    ui.addControl(title);

    
    const subtitle = new BABYLON.GUI.TextBlock();
    subtitle.text = "~ Dreamscape Escape ~";
    subtitle.color = "#B0B0D0";
    subtitle.fontSize = 28;
    subtitle.top = "-140px";
    subtitle.fontStyle = "italic";
    ui.addControl(subtitle);

    
    const description = new BABYLON.GUI.TextBlock();
    description.text = "Collect Dream Fragments and escape before the shadow entity catches you!\n\n⏱️ 90 seconds to survive\n⭐ 8 Dream Fragments to collect\n🚪 Find the hidden Exit Portal\n👹 Avoid the lurking nightmare";
    description.color = "white";
    description.fontSize = 18;
    description.lineSpacing = "10px";
    description.top = "-60px"; 
    description.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    ui.addControl(description);

    
    const scoringInfo = new BABYLON.GUI.TextBlock();
    scoringInfo.text = "💎 Dream Fragment: +100 points\n⏰ Time Bonus: Remaining time × 10\n💀 Caught penalty: -50 points";
    scoringInfo.color = "#FFD700";
    scoringInfo.fontSize = 16;
    scoringInfo.top = "100px"; 
    scoringInfo.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    ui.addControl(scoringInfo);

    
    const startButton = BABYLON.GUI.Button.CreateSimpleButton("startButton", "⚡ Enter the Nightmare ⚡");
    startButton.widthInPixels = 300;
    startButton.heightInPixels = 60;
    startButton.color = "white";
    startButton.background = "#4A0E4E";
    startButton.top = "170px"; 
    startButton.cornerRadius = 15;
    startButton.fontSize = 20;
    startButton.fontWeight = "bold";
    
    
    startButton.isPointerBlocker = true;
    startButton.zIndex = 100;
    
    
    startButton.onPointerEnterObservable.add(() => {
        startButton.background = "#6A1B9A";
        startButton.scaleX = 1.05;
        startButton.scaleY = 1.05;
    });
    
    startButton.onPointerOutObservable.add(() => {
        startButton.background = "#4A0E4E";
        startButton.scaleX = 1;
        startButton.scaleY = 1;
    });
    
    
    startButton.onPointerClickObservable.add(() => {
        console.log("Starting game...");
        game.startGame();
    });
    
    ui.addControl(startButton);

    
    const instructions = new BABYLON.GUI.TextBlock();
    instructions.text = "Controls: WASD - Move | Mouse - Look | Space - Jump | E - Interact";
    instructions.color = "#888";
    instructions.fontSize = 14;
    instructions.top = "240px"; 
    ui.addControl(instructions);

    return scene;
}