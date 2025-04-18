import styles from "./LyricsDisplay.module.css";

export default function LyricsDisplay({ lyrics }: { lyrics: string }) {
  return (
    <div className={styles.container}>
      <h2>Lyrics:</h2>
      <pre className={styles.lyrics}>{lyrics}</pre>
    </div>
  );
}