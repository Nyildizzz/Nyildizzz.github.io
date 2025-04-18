"use client";

import { useState } from "react";
import LyricsDisplay from "./LyricsDisplay";
import ErrorMessage from "./ErrorMessage";
import styles from "./LyricsForm.module.css";

export default function LyricsForm() {
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState("");
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLyrics = async () => {
    if (!artist || !song) {
      setError("Please provide both artist and song name.");
      return;
    }

    setError(null);
    setLyrics(null);

    const normalizedArtist = artist.trim().toLowerCase().replace(/\s+/g, " ");
    const normalizedSong = song.trim().toLowerCase().replace(/\s+/g, " ");

    try {
      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(normalizedArtist)}/${encodeURIComponent(normalizedSong)}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          setError("Lyrics not found. Please check the artist and song name.");
        } else {
          setError(`An error occurred: ${response.statusText}`);
        }
        return;
      }
      const data = await response.json();
      setLyrics(data.lyrics);
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      setError("An error occurred while fetching lyrics.");
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        className={styles.input}
      />
      <input
        type="text"
        placeholder="Song"
        value={song}
        onChange={(e) => setSong(e.target.value)}
        className={styles.input}
      />
      <button onClick={fetchLyrics} className={styles.button}>
        Get Lyrics
      </button>
      {error && <ErrorMessage message={error} />}
      {lyrics && <LyricsDisplay lyrics={lyrics} />}
    </div>
  );
}