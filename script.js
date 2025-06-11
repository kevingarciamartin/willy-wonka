document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loadingScreen");
  const loadingProgress = document.getElementById("loadingProgress");
  const loadingInstruction = document.getElementById("loadingInstruction");
  const cameraRig = document.getElementById("cameraRig");
  const leftDoor = document.getElementById("leftDoor");
  const rightDoor = document.getElementById("rightDoor");

  // A-Frame: Register custom component to play sound on user gesture
  AFRAME.registerComponent("play-on-user-gesture", {
    schema: {
      target: { type: "selector", default: "a-scene" },
      sound: { type: "string", default: "sound" },
      volume: { type: "number", default: 0.25 },
    },
    init: function () {
      const el = this.el;
      const data = this.data;
      const targetEl = data.target;

      // Flag to ensure sound only plays once
      this.soundPlayed = false;

      const playSound = () => {
        if (!this.soundPlayed) {
          const soundComponent = el.components[data.sound];
          if (soundComponent && soundComponent.playSound) {
            soundComponent.playSound();
            el.setAttribute("sound", "volume", data.volume);
            this.soundPlayed = true;
          }
        }
        // Remove listeners after sound is played
        targetEl.removeEventListener("click", playSound);
        document.removeEventListener("keydown", playSound);
        // Also remove if entering VR (which is a user gesture)
        document
          .querySelector("a-scene")
          .removeEventListener("enter-vr", playSound);
      };

      // Listen for user gestures on the target element
      targetEl.addEventListener("click", playSound);
      document.addEventListener("keydown", playSound);
      // Listen for entering VR mode, as this is also a user gesture
      document.querySelector("a-scene").addEventListener("enter-vr", playSound);

      // Listen for user gestures on the target element (which will be #loadingScreen)
      targetEl.addEventListener("click", playSound);
      targetEl.addEventListener("keydown", playSound);

      // Listen for entering VR mode on the scene, as this is also a user gesture
      // (This is a fallback if someone manages to enter VR before the click/key on loading screen)
      document.querySelector("a-scene").addEventListener("enter-vr", playSound);
    },
  });

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
        loadingInstruction.classList.remove("hidden");

        // Now, wait for user interaction on the loading screen to hide it and start the experience
        const initiateExperience = () => {
          // Remove listeners immediately to prevent multiple calls
          loadingScreen.removeEventListener("click", initiateExperience);
          document.removeEventListener("keydown", initiateExperience); // Remove keydown listener from document

          // Enable camera controls
          cameraRig.setAttribute("look-controls", "enabled", true);
          cameraRig.setAttribute("wasd-controls", "enabled", true);

          // Reset camera position and to elevator start
          cameraRig.setAttribute("position", "0 1.85 7.5");

          // Trigger door opening animations
          leftDoor.emit("openDoors");
          rightDoor.emit("openDoors");

          // Fade out and remove loading screen
          loadingScreen.style.opacity = "0";
          loadingScreen.style.transition = "opacity 1.5s ease-out";

          setTimeout(() => {
            loadingScreen.remove();
            // The `play-on-user-gesture` component, whose target is #loadingScreen,
            // will have its `playSound` method triggered by this same click/keydown event
            // that calls `initiateExperience`.
          }, 1500); // Wait for the fade out to complete
        };

        // Attach listeners to the loading screen for interaction
        loadingScreen.addEventListener("click", initiateExperience);
        document.addEventListener("keydown", initiateExperience);
      }
    });
  });
});
