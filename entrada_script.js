const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function transposeNote(note, semitones) {
    let isMinor = note.endsWith('m');
    let baseNote = isMinor ? note.slice(0, -1) : note;
    
    let index = notes.indexOf(baseNote);
    if (index === -1) index = flats.indexOf(baseNote);
    if (index === -1) return note;
    
    index = (index + semitones + 12) % 12;
    let newNote = notes[index];
    if (baseNote.includes('b')) {
        newNote = flats[index];
    }

    return isMinor ? newNote + 'm' : newNote;
}

function transposeChord(chord, semitones) {
    const [upperChord, bassNote] = chord.split('/');
    
    const match = upperChord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;
    let [, note, modifier] = match;
    let transposedNote = transposeNote(note, semitones);
    let transposedUpperChord = transposedNote + modifier;
    
    if (bassNote) {
        const transposedBassNote = transposeNote(bassNote, semitones);
        return `${transposedUpperChord}/${transposedBassNote}`;
    }
    return transposedUpperChord;
}

function transposeChords(semitones) {
    document.querySelectorAll('.chordpro-chord').forEach(chordSpan => {
        const originalChord = chordSpan.getAttribute('data-chord');
        const transposedChord = transposeChord(originalChord, semitones);
        chordSpan.setAttribute('data-chord', transposedChord);
        chordSpan.textContent = transposedChord;
    });

    const keySpan = document.querySelector('.chordpro-metadata-value');
    if (keySpan) {
        const currentKey = keySpan.textContent;
        const newKey = transposeNote(currentKey, semitones);
        keySpan.textContent = newKey;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const transposeUpButton = document.getElementById('transposeUp');
    const transposeDownButton = document.getElementById('transposeDown');

    if (transposeUpButton) {
        transposeUpButton.addEventListener('click', function() {
            transposeChords(1);
        });
    }

    if (transposeDownButton) {
        transposeDownButton.addEventListener('click', function() {
            transposeChords(-1);
        });
    }
});
