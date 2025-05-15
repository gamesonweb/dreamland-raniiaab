export function setupPlayerControls(scene, canvas) {
    
    const player = BABYLON.MeshBuilder.CreateCapsule("player", { height: 1.8, radius: 0.4 }, scene);
    player.position = new BABYLON.Vector3(0, 1, 0);

    
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2, 
        Math.PI / 3,  
        5,            
        player.position,
        scene
    );
    camera.upperRadiusLimit = 10; 
    camera.lowerRadiusLimit = 3;  
    camera.attachControl(canvas, true);

    
    const keys = {};
    scene.onKeyboardObservable.add((kbInfo) => {
        keys[kbInfo.event.code] = kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN;
    });

    scene.onBeforeRenderObservable.add(() => {
        const deltaTime = scene.getEngine().getDeltaTime() / 1000;
        const speed = 4.0;
        const moveDirection = new BABYLON.Vector3(0, 0, 0);

        
        if (keys["KeyW"]) moveDirection.z += 1;
        if (keys["KeyS"]) moveDirection.z -= 1;

        
        if (keys["KeyA"]) moveDirection.x -= 1;
        if (keys["KeyD"]) moveDirection.x += 1;

        
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            const forward = camera.getForwardRay().direction;
            const right = camera.getRightRay().direction;
            forward.y = 0;
            right.y = 0;
            player.position.addInPlace(forward.scale(moveDirection.z * speed * deltaTime));
            player.position.addInPlace(right.scale(moveDirection.x * speed * deltaTime));
        }

        
        camera.setTarget(player.position);
    });

    return { player, camera };
}