document.getElementById("get-lyrics").addEventListener("click", async () => {
  const artist = document.getElementById("artist").value.trim();
  const song = document.getElementById("song").value.trim();
  const errorMessage = document.getElementById("error-message");
  const lyricsDisplay = document.getElementById("lyrics-display");

  errorMessage.style.display = "none";
  lyricsDisplay.style.display = "none";

  if (!artist || !song) {
    errorMessage.textContent = "Please provide both artist and song name.";
    errorMessage.style.display = "block";
    return;
  }

  try {
    const response = await fetch(`https://api.lyrics.ovh/v1/${artist}/${song}`);
    if (!response.ok) {
      throw new Error("Lyrics not found. Please check the artist and song name.");
    }
    const data = await response.json();

    lyricsDisplay.textContent = data.lyrics;
    lyricsDisplay.style.display = "block";
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.style.display = "block";
  }
});