# Voiceover Scripts for ElevenLabs

These scripts are formatted for optimal AI voice generation using ElevenLabs.

## Recommended Settings

### Voice Selection
- **Primary choice**: Josh (friendly, professional male)
- **Alternative**: Sam or Charlie

### ElevenLabs Settings
- **Stability**: 0.5 (balanced)
- **Clarity + Similarity Enhancement**: 0.75
- **Style**: 0 (neutral)
- **Speaker Boost**: Enabled

## Scripts

| File | Duration | Characters |
|------|----------|------------|
| lesson-builder-voiceover.txt | ~3:45 | ~2,400 |
| curriculum-voiceover.txt | ~4:00 | ~2,500 |
| staff-management-voiceover.txt | ~4:20 | ~2,700 |
| attendance-voiceover.txt | ~3:30 | ~2,200 |
| reports-voiceover.txt | ~4:00 | ~2,400 |

**Total**: ~12,200 characters (fits within free tier's 10,000/month if split across 2 months, or upgrade to paid)

## How to Generate

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Select voice (Josh recommended)
3. Copy text from script file (skip the header comments)
4. Generate and download MP3
5. Name file: `[feature]-voiceover.mp3`

## Output Files

After generation, place MP3 files in:
```
/training/voiceovers/audio/
  lesson-builder-voiceover.mp3
  curriculum-voiceover.mp3
  staff-management-voiceover.mp3
  attendance-voiceover.mp3
  reports-voiceover.mp3
```

## Workflow

1. Generate voiceovers (ElevenLabs)
2. Record screen while listening to voiceover
3. Use Remotion to merge video + audio
4. Export final video
5. Upload to YouTube (unlisted)
6. Add video ID to training page
