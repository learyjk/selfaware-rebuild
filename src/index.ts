import { gsap } from 'gsap';
import SplitType from 'split-type';

type LetterPosition = {
  letter: string;
  top: number;
  left: number;
};

window.Webflow ||= [];
window.Webflow.push(async () => {
  // CONSTANTS
  const layout = document.querySelector<HTMLDivElement>('.layout');
  const split = new SplitType('.heading-text', { absolute: true, types: 'chars' });
  const characters = split.chars;
  const padding = 32;
  const letterSize = 100;

  if (!layout || !split || !characters) return;

  // VARIABLES
  let tl = gsap.timeline();
  let endPositions: LetterPosition[] = [];
  let MIN_X: number;
  let MIN_Y: number;
  let MAX_X: number;
  let MAX_Y: number;

  // HELPER FUNCTIONS
  const introAnimation = async () => {
    await tl
      .from(split.chars, {
        duration: 0.4,
        yPercent: 100,
        stagger: 0.05,
        ease: 'back.out(1.7)',
      })
      .to('.section', {
        padding: '1rem',
      })
      .to(
        layout,
        {
          height: '60dvh',
          borderRadius: '1rem',
          onComplete: () => {
            // define bounds after resizing the layout div.
            let layoutRect = layout.getBoundingClientRect();
            MIN_X = layoutRect.left + padding;
            MIN_Y = layoutRect.top + padding;
            MAX_X = layoutRect.right - padding - letterSize;
            MAX_Y = layoutRect.bottom - padding - letterSize;
            console.log({ MIN_X, MIN_Y, MAX_X, MAX_Y });
          },
        },
        '<'
      )
      .set('.heading-text', { width: '100%', height: '100%' }, '<');
  };

  // sets end positions for each letter with no overlaps
  const setEndPositions = (characters: HTMLElement[]) => {
    let i = 0;
    let endPositions: LetterPosition[] = [];

    while (i < characters.length) {
      let char = characters[i];
      // get a random value inside of the layout
      let randomLeft = Math.floor(Math.random() * (MAX_X - MIN_X + 1) + MIN_X);
      let randomTop = Math.floor(Math.random() * (MAX_Y - MIN_Y + 1) + MIN_Y);

      // check if the random value overlaps with any other letters
      let overlaps = false;

      for (let j = 0; j < i; j++) {
        let otherPos = endPositions[j];
        let distance = Math.hypot(randomLeft - otherPos.left, randomTop - otherPos.top);

        if (distance < letterSize * 1.5) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        endPositions.push({
          letter: char.innerHTML,
          top: randomTop,
          left: randomLeft,
        });
        i++;
      }
    }
    return endPositions;
  };

  const shuffleCharacters = async () => {
    endPositions = setEndPositions(characters);
    await tl.to(characters, {
      left: (index) => {
        return endPositions[index].left;
      },
      top: (index) => {
        return endPositions[index].top;
      },
      rotate: () => {
        return Math.random() * 360 - 180;
      },
      scale: 2,
      duration: 0.5,
    });
  };

  let tween: GSAPTween;
  let randomCharacter: HTMLElement;
  const randomLetterClickedAnimation = async () => {
    // clean up previous animation
    if (tween) tween.kill();
    if (randomCharacter) {
      randomCharacter.removeEventListener('click', randomLetterClickedAnimation);
      await shuffleCharacters();
    }

    // choose a random character and shake it.
    let randomIndex = Math.floor(Math.random() * characters.length);
    randomCharacter = characters[randomIndex];
    randomCharacter.style.transformOrigin = 'center center';

    // shake
    tween = gsap.to(randomCharacter, {
      rotate: '+=5',
      yoyo: true,
      repeat: -1,
      repeatDelay: 0.05,
      ease: 'none',
      duration: 0.05,
    });

    // repeat if clicked
    randomCharacter.addEventListener('click', randomLetterClickedAnimation);
  };

  // EXECUTION
  await introAnimation();
  await shuffleCharacters();
  randomLetterClickedAnimation();
});
