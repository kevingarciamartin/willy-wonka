document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loadingScreen");
  const loadingProgress = document.getElementById("loadingProgress");
  const spinner = document.getElementById("spinner");
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
        loadingProgress.style.display = "none";
        spinner.classList.remove("spinner-hidden");
        // Add a small delay to allow for rendering to catch up
        setTimeout(() => {
          // Trigger door opening animations
          leftDoor.emit("openDoors");
          rightDoor.emit("openDoors");

          // Fade out and remove loading screen
          loadingScreen.style.opacity = "0";
          loadingScreen.style.transition = "opacity 1.5s ease-out";

          setTimeout(() => {
            loadingScreen.remove();
          }, 1500); // Wait for the fade out to complete
        }, 3000); // Increased delay for rendering to settle
      }
    });
  });
});
