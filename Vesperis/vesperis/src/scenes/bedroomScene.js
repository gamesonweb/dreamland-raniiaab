export function createBedroomScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.1, 0.05, 0.15, 1);

    
    const { player, camera } = setupPlayerControls(scene, canvas);

    
    const mirrors = [];
    const mirrorPositions = [
        new BABYLON.Vector3(5, 1, 0),  
        new BABYLON.Vector3(-5, 1, 0), 
        new BABYLON.Vector3(0, 1, 5),  
        new BABYLON.Vector3(0, 1, -5)  
    ];

    mirrorPositions.forEach((pos, i) => {
        const mirror = BABYLON.MeshBuilder.CreatePlane("mirror", { size: 2 }, scene);
        mirror.position = pos;
        mirror.lookAt(player.position);
        mirrors.push(mirror);
    });

    
    scene.onBeforeRenderObservable.add(() => {
        mirrors.forEach((mirror) => {
            if (BABYLON.Vector3.Distance(player.position, mirror.position) < 2) {
                const dreamScene = createDreamScene(engine, canvas);
                window.switchScene(dreamScene);
            }
        });
    });

    return scene;
}