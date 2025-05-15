export function createEnemyAI(scene, playerMesh, gameState) {
    
    
    const freddyBody = BABYLON.MeshBuilder.CreateCylinder("freddyBody", {
        height: 1.8,
        diameter: 0.8,
        tessellation: 8
    }, scene);
    freddyBody.position = new BABYLON.Vector3(-20, 0.9, 20);
    
    
    const freddyHead = BABYLON.MeshBuilder.CreateSphere("freddyHead", { diameter: 0.6 }, scene);
    freddyHead.position = new BABYLON.Vector3(0, 1.3, 0);
    freddyHead.parent = freddyBody;
    
    
    const freddyHat = BABYLON.MeshBuilder.CreateCylinder("freddyHat", {
        height: 0.3,
        diameterTop: 0.5,
        diameterBottom: 0.7,
        tessellation: 8
    }, scene);
    freddyHat.position = new BABYLON.Vector3(0, 1.5, 0);
    freddyHat.parent = freddyBody;
    
    
    const leftArm = BABYLON.MeshBuilder.CreateCapsule("leftArm", { height: 0.8, radius: 0.12 }, scene);
    leftArm.position = new BABYLON.Vector3(-0.5, 0.8, 0);
    leftArm.parent = freddyBody;
    
    const rightArm = BABYLON.MeshBuilder.CreateCapsule("rightArm", { height: 0.8, radius: 0.12 }, scene);
    rightArm.position = new BABYLON.Vector3(0.5, 0.8, 0);
    rightArm.parent = freddyBody;
    
    
    const freddyGlove = BABYLON.MeshBuilder.CreateBox("freddyGlove", { width: 0.3, height: 0.15, depth: 0.2 }, scene);
    freddyGlove.position = new BABYLON.Vector3(0.7, 0.3, 0);
    freddyGlove.parent = freddyBody;
    
    
    for (let i = 0; i < 4; i++) {
        const claw = BABYLON.MeshBuilder.CreateCylinder(`claw${i}`, {
            height: 0.8,
            diameter: 0.03,
            tessellation: 6
        }, scene);
        claw.position = new BABYLON.Vector3(0.7 + (i - 1.5) * 0.1, 0.2, 0.1);
        claw.rotation.x = Math.PI / 6;
        claw.parent = freddyBody;
        
        const clawMat = new BABYLON.StandardMaterial(`clawMat${i}`, scene);
        clawMat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.9);
        clawMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        claw.material = clawMat;
    }
    
    
    const leftLeg = BABYLON.MeshBuilder.CreateCapsule("leftLeg", { height: 0.9, radius: 0.15 }, scene);
    leftLeg.position = new BABYLON.Vector3(-0.2, 0.1, 0);
    leftLeg.parent = freddyBody;
    
    const rightLeg = BABYLON.MeshBuilder.CreateCapsule("rightLeg", { height: 0.9, radius: 0.15 }, scene);
    rightLeg.position = new BABYLON.Vector3(0.2, 0.1, 0);
    rightLeg.parent = freddyBody;
    
    
    
    const skinMat = new BABYLON.StandardMaterial("freddySkinMat", scene);
    skinMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
    skinMat.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0.02);
    freddyHead.material = skinMat;
    leftArm.material = skinMat;
    rightArm.material = skinMat;
    leftLeg.material = skinMat;
    rightLeg.material = skinMat;
    
    
    const sweaterMat = new BABYLON.StandardMaterial("freddySweaterMat", scene);
    sweaterMat.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
    sweaterMat.emissiveColor = new BABYLON.Color3(0.2, 0.02, 0.02);
    freddyBody.material = sweaterMat;
    
    
    const hatMat = new BABYLON.StandardMaterial("freddyHatMat", scene);
    hatMat.diffuseColor = new BABYLON.Color3(0.2, 0.1, 0.05);
    freddyHat.material = hatMat;
    
    
    const gloveMat = new BABYLON.StandardMaterial("freddyGloveMat", scene);
    gloveMat.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
    freddyGlove.material = gloveMat;
    
    
    const freddyLight = new BABYLON.PointLight("freddyLight", freddyBody.position, scene);
    freddyLight.intensity = 0.3;
    freddyLight.diffuse = new BABYLON.Color3(1, 0.2, 0);
    freddyLight.range = 6;
    freddyLight.parent = freddyBody;
    
    
    let aiState = {
        mode: 'PATROL',
        lastPlayerSeen: null,
        patrolTarget: null,
        huntStartTime: 0,
        attackCooldown: 0,
        speed: 3.0,
        viewDistance: 8,
        attackRange: 1.5
    };
    
    const patrolPoints = [
        new BABYLON.Vector3(-20, 0.9, 20),
        new BABYLON.Vector3(20, 0.9, 20),
        new BABYLON.Vector3(20, 0.9, -20),
        new BABYLON.Vector3(-20, 0.9, -20),
        new BABYLON.Vector3(0, 0.9, 15),
        new BABYLON.Vector3(15, 0.9, 0),
        new BABYLON.Vector3(0, 0.9, -15),
        new BABYLON.Vector3(-15, 0.9, 0)
    ];
    
    let currentPatrolIndex = 0;
    aiState.patrolTarget = patrolPoints[currentPatrolIndex];
    
    
    function distanceToPlayer() {
        return BABYLON.Vector3.Distance(freddyBody.position, playerMesh.position);
    }
    
    function canSeePlayer() {
        return distanceToPlayer() <= aiState.viewDistance;
    }
    
    function moveTowards(target, deltaTime) {
        const direction = target.subtract(freddyBody.position);
        const distance = direction.length();
        
        if (distance > 0.5) {
            direction.normalize();
            const moveDistance = aiState.speed * deltaTime;
            
            const newPos = freddyBody.position.add(direction.scale(moveDistance));
            
            
            if (Math.abs(newPos.x) < 24 && Math.abs(newPos.z) < 24) {
                freddyBody.position = newPos;
            }
            
            freddyBody.lookAt(target);
        }
        
        return distance <= 0.5;
    }
    
    function updatePatrolBehavior(deltaTime) {
        if (moveTowards(aiState.patrolTarget, deltaTime)) {
            currentPatrolIndex = (currentPatrolIndex + 1) % patrolPoints.length;
            aiState.patrolTarget = patrolPoints[currentPatrolIndex];
        }
        
        if (canSeePlayer()) {
            aiState.mode = 'HUNT';
            aiState.lastPlayerSeen = playerMesh.position.clone();
            console.log("Freddy spotted the player!");
        }
    }
    
    function updateHuntBehavior(deltaTime) {
        const distance = distanceToPlayer();
        
        if (distance <= aiState.attackRange) {
            aiState.mode = 'ATTACK';
            return;
        }
        
        if (canSeePlayer()) {
            aiState.lastPlayerSeen = playerMesh.position.clone();
        }
        
        let targetPos = playerMesh.position;
        if (aiState.lastPlayerSeen) {
            targetPos = aiState.lastPlayerSeen;
        }
        
        moveTowards(targetPos, deltaTime);
    }
    
    function updateAttackBehavior(deltaTime) {
        const distance = distanceToPlayer();
        
        if (distance > aiState.attackRange * 1.5) {
            aiState.mode = 'HUNT';
            return;
        }
        
        if (aiState.attackCooldown > 0) {
            aiState.attackCooldown -= deltaTime;
            return;
        }
        
        if (distance <= aiState.attackRange) {
            console.log("Freddy catches the player! GAME OVER!");
            gameState.gameLost = true;
            gameState.gameRunning = false;
            aiState.attackCooldown = 1.0;
            
            
            sweaterMat.emissiveColor = new BABYLON.Color3(1, 0.2, 0);
            setTimeout(() => {
                sweaterMat.emissiveColor = new BABYLON.Color3(0.2, 0.02, 0.02);
            }, 300);
        }
    }
    
    
    function updateAI(deltaTime) {
        aiState.speed = (gameState.enemySpeed || 1.0) * 3.0;
        
        switch (aiState.mode) {
            case 'PATROL':
                updatePatrolBehavior(deltaTime);
                break;
            case 'HUNT':
                updateHuntBehavior(deltaTime);
                break;
            case 'ATTACK':
                updateAttackBehavior(deltaTime);
                break;
        }
        
        
        const time = Date.now() * 0.001;
        freddyBody.position.y = 0.9 + Math.sin(time * 1.5) * 0.02;
        freddyLight.intensity = 0.2 + Math.sin(time * 3) * 0.1;
    }
    
    scene.registerBeforeRender(() => {
        if (gameState.gameRunning) {
            const deltaTime = scene.getEngine().getDeltaTime() / 1000;
            updateAI(deltaTime);
        }
    });
    
    
    return {
        mesh: freddyBody,
        getMode: () => aiState.mode,
        getDistanceToPlayer: distanceToPlayer,
        setPosition: (position) => { freddyBody.position = position.clone(); },
        teleportToRandomLocation: () => {
            const randomPoint = patrolPoints[Math.floor(Math.random() * patrolPoints.length)];
            freddyBody.position = randomPoint.clone();
            aiState.mode = 'PATROL';
        },
        dispose: () => {
            freddyBody.dispose();
        }
    };
}