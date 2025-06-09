document.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector("a-scene");
  const loadingScreen = document.getElementById("loadingScreen");
  const loadingProgress = document.getElementById("loadingProgress");
  const cameraShake = document.getElementById("cameraShake");
  const leftDoor = document.getElementById("leftDoor");
  const rightDoor = document.getElementById("rightDoor");

  // Get all gltf model assets
  const gltfModels = document.querySelectorAll('a-asset-item[src$=".gltf"]');
  const totalModels = gltfModels.length;
  let loadedModels = 0;

  // Function to update loading progress
  const updateProgress = () => {
    const progress = Math.round((loadedModels / totalModels) * 100);
    loadingProgress.textContent = `${progress}%`;
  };

  // Listen for 'loaded' event on each individual gltf asset
  gltfModels.forEach((modelAsset) => {
    modelAsset.addEventListener("loaded", () => {
      loadedModels++;
      updateProgress();

      if (loadedModels === totalModels) {
        console.log("All GLTF models loaded!");
        // Add a small delay to allow for rendering to catch up
        setTimeout(() => {
          // 1. Stop camera shake
          cameraShake.setAttribute("animation", { enabled: false });
          document
            .getElementById("cameraRig")
            .setAttribute("position", "0 1.85 7.5");

          // 2. Trigger door opening animations
          leftDoor.emit("openDoors");
          rightDoor.emit("openDoors");

          // 3. Fade out and remove loading screen
          loadingScreen.style.opacity = "0";
          loadingScreen.style.transition = "opacity 1.5s ease-out"; // Smooth fade out

          setTimeout(() => {
            loadingScreen.remove();
          }, 1500); // Wait for the fade out to complete
        }, 750); // Increased delay for rendering to settle (adjust as needed)
      }
    });
  });
});
