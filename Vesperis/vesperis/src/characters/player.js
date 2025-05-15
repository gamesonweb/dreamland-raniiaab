export function createPlayer(scene, canvas) {
    
    
    const playerBody = BABYLON.MeshBuilder.CreateCapsule("playerBody", { height: 1.6, radius: 0.3 }, scene);
    playerBody.position = new BABYLON.Vector3(0, 0.8, -20);
    
    
    const playerHead = BABYLON.MeshBuilder.CreateSphere("playerHead", { diameter: 0.5 }, scene);
    playerHead.position = new BABYLON.Vector3(0, 1.5, 0);
    playerHead.parent = playerBody;
    
    
    const playerHair = BABYLON.MeshBuilder.CreateCylinder("playerHair", { 
        height: 0.6, diameter: 0.6, tessellation: 8 
    }, scene);
    playerHair.position = new BABYLON.Vector3(0, 1.8, 0);
    playerHair.parent = playerBody;
    
    
    const leftArm = BABYLON.MeshBuilder.CreateCapsule("leftArm", { height: 0.8, radius: 0.1 }, scene);
    leftArm.position = new BABYLON.Vector3(-0.4, 1.0, 0);
    leftArm.parent = playerBody;
    
    const rightArm = BABYLON.MeshBuilder.CreateCapsule("rightArm", { height: 0.8, radius: 0.1 }, scene);
    rightArm.position = new BABYLON.Vector3(0.4, 1.0, 0);
    rightArm.parent = playerBody;
    
    
    const leftLeg = BABYLON.MeshBuilder.CreateCapsule("leftLeg", { height: 0.9, radius: 0.12 }, scene);
    leftLeg.position = new BABYLON.Vector3(-0.15, 0.1, 0);
    leftLeg.parent = playerBody;
    
    const rightLeg = BABYLON.MeshBuilder.CreateCapsule("rightLeg", { height: 0.9, radius: 0.12 }, scene);
    rightLeg.position = new BABYLON.Vector3(0.15, 0.1, 0);
    rightLeg.parent = playerBody;
    
    
    const bodyMat = new BABYLON.StandardMaterial("bodyMat", scene);
    bodyMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0.7); 
    playerBody.material = bodyMat;
    playerHead.material = bodyMat;
    leftArm.material = bodyMat;
    rightArm.material = bodyMat;
    leftLeg.material = bodyMat;
    rightLeg.material = bodyMat;
    
    
    const hairMat = new BABYLON.StandardMaterial("hairMat", scene);
    hairMat.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
    playerHair.material = hairMat;
    
    
    const shirt = BABYLON.MeshBuilder.CreateCylinder("shirt", { 
        height: 0.5, diameter: 0.65 
    }, scene);
    shirt.position = new BABYLON.Vector3(0, 1.1, 0);
    shirt.parent = playerBody;
    
    const shirtMat = new BABYLON.StandardMaterial("shirtMat", scene);
    shirtMat.diffuseColor = new BABYLON.Color3(0.8, 0.9, 1); 
    shirt.material = shirtMat;

    
    const camera = new BABYLON.ArcRotateCamera("playerCamera", -Math.PI/2, Math.PI/3, 6, playerBody, scene);
    camera.attachControl(canvas, true);
    
    
    camera.lowerAlphaLimit = null;
    camera.upperAlphaLimit = null;
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI/2;
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 12;
    camera.angularSensibilityX = 1000;
    camera.angularSensibilityY = 1000;

    
    let isJumping = false;
    let velocityY = 0;
    const gravity = -15;
    const jumpSpeed = 8;
    const groundY = 0.8; 
    const moveSpeed = 4;
    const rotationSpeed = 3;

    
    const inputMap = {
        w: false,
        a: false,
        s: false,
        d: false,
        space: false,
        shift: false,
        e: false
    };

    
    scene.actionManager = new BABYLON.ActionManager(scene);
    
    
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            const key = evt.sourceEvent.key.toLowerCase();
            if (inputMap.hasOwnProperty(key)) {
                inputMap[key] = true;
            }
            if (key === ' ') {
                inputMap.space = true;
            }
        }
    ));
    
    
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            const key = evt.sourceEvent.key.toLowerCase();
            if (inputMap.hasOwnProperty(key)) {
                inputMap[key] = false;
            }
            if (key === ' ') {
                inputMap.space = false;
            }
        }
    ));

    
    function checkWallCollision(newPosition) {
        
        const margin = 0.8;
        if (Math.abs(newPosition.x) >= 24.5 - margin || Math.abs(newPosition.z) >= 24.5 - margin) {
            return false;
        }

        
        
        const wallPositions = [
            
            { pos: [10, 0, 10], size: [15, 4, 0.3] },
            { pos: [-10, 0, -10], size: [15, 4, 0.3] },
            { pos: [0, 0, 15], size: [0.3, 4, 10] },
            { pos: [-15, 0, 5], size: [0.3, 4, 20] },
            { pos: [15, 0, -5], size: [0.3, 4, 20] },
            { pos: [5, 0, -15], size: [10, 4, 0.3] },
            { pos: [-5, 0, 5], size: [10, 4, 0.3] },
        ];

        for (const wall of wallPositions) {
            const wallX = wall.pos[0];
            const wallZ = wall.pos[2];
            const wallWidth = wall.size[0] / 2;
            const wallDepth = wall.size[2] / 2;

            if (newPosition.x >= wallX - wallWidth - margin && 
                newPosition.x <= wallX + wallWidth + margin &&
                newPosition.z >= wallZ - wallDepth - margin && 
                newPosition.z <= wallZ + wallDepth + margin) {
                return false;
            }
        }

        return true;
    }

    
    scene.registerBeforeRender(() => {
        const deltaTime = scene.getEngine().getDeltaTime() / 1000;
        
        
        let movement = BABYLON.Vector3.Zero();
        let rotation = 0;

        
        if (inputMap.a) rotation = rotationSpeed * deltaTime;
        if (inputMap.d) rotation = -rotationSpeed * deltaTime;
        
        
        if (rotation !== 0) {
            playerBody.rotation.y += rotation;
        }

        
        if (inputMap.w) {
            movement = playerBody.getDirection(BABYLON.Vector3.Forward());
        }
        if (inputMap.s) {
            movement = playerBody.getDirection(BABYLON.Vector3.Forward()).negate();
        }

        
        if (movement.length() > 0) {
            movement.y = 0; 
            movement.normalize();
            movement.scaleInPlace(moveSpeed * deltaTime);
            
            const newPosition = playerBody.position.add(movement);
            
            
            if (checkWallCollision(newPosition)) {
                playerBody.position = newPosition;
            }
        }

        
        if (inputMap.space && !isJumping && playerBody.position.y <= groundY + 0.1) {
            isJumping = true;
            velocityY = jumpSpeed;
        }

        
        if (isJumping) {
            velocityY += gravity * deltaTime;
            const newY = playerBody.position.y + velocityY * deltaTime;
            
            
            if (newY <= groundY) {
                playerBody.position.y = groundY;
                isJumping = false;
                velocityY = 0;
            } else {
                playerBody.position.y = newY;
            }
        }

        
        camera.setTarget(playerBody.position);
    });

    
    const respawnPositions = [
        new BABYLON.Vector3(0, groundY, -20),
        new BABYLON.Vector3(-15, groundY, -15),
        new BABYLON.Vector3(15, groundY, -15),
        new BABYLON.Vector3(-10, groundY, 10),
        new BABYLON.Vector3(10, groundY, 10)
    ];

    function respawnPlayer() {
        const randomIndex = Math.floor(Math.random() * respawnPositions.length);
        const spawnPos = respawnPositions[randomIndex];
        
        playerBody.position = spawnPos.clone();
        playerBody.rotation.y = 0; 
        
        
        isJumping = false;
        velocityY = 0;
        
        console.log("Player respawned at:", spawnPos);
    }

    
    return {
        camera: camera,
        mesh: playerBody, 
        
        
        getPosition: () => playerBody.position,
        setPosition: (position) => {
            playerBody.position = position.clone();
        },
        
        
        getInputState: () => ({ ...inputMap }),
        isMoving: () => inputMap.w || inputMap.s,
        isTurning: () => inputMap.a || inputMap.d,
        isJumping: () => isJumping,
        
        
        respawn: respawnPlayer,
        
        
        setCameraDistance: (distance) => {
            camera.radius = Math.max(3, Math.min(12, distance));
        },
        
        
        enableControls: () => {
            camera.attachControl(canvas, true);
            scene.actionManager.actions.forEach(action => action.enabled = true);
        },
        
        disableControls: () => {
            camera.detachControl(canvas);
            
            Object.keys(inputMap).forEach(key => inputMap[key] = false);
        },
        
        
        addFlashEffect: (color = new BABYLON.Color3(1, 0, 0), duration = 200) => {
            const originalColor = bodyMat.diffuseColor.clone();
            bodyMat.diffuseColor = color;
            setTimeout(() => {
                bodyMat.diffuseColor = originalColor;
            }, duration);
        },
        
        
        getAllMeshes: () => [playerBody, playerHead, playerHair, leftArm, rightArm, leftLeg, rightLeg, shirt],
        
        
        dispose: () => {
            if (scene.actionManager) {
                scene.actionManager.actions = [];
            }
            camera.detachControl(canvas);
            playerBody.dispose();
            playerHead.dispose();
            playerHair.dispose();
            leftArm.dispose();
            rightArm.dispose();
            leftLeg.dispose();
            rightLeg.dispose();
            shirt.dispose();
        }
    };
}