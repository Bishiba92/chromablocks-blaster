Chromablock Blaster v4

Implemented:
- Five placeholder music tracks:
  - audio/music0.wav
  - audio/music1.wav
  - audio/music2.wav
  - audio/music3.wav
  - audio/music4.wav
- Music rotates through all five tracks.
- Added placeholder SFX:
  - place.wav: piece successfully placed.
  - clear.wav: normal single line clear.
  - combo.wav: combo level 2+.
  - bad.wav: invalid drop.
  - preview.wav: first valid hover preview after no/invalid preview.
  - perfect.wav: same-color line clear, giving 2x points.
  - multiline.wav: 2+ lines cleared at once.
  - massive.wav: 3+ lines, or multiline plus perfect color.
- Added occupied block texture variation:
  - img/baseCube0.png through img/baseCube9.png
- Added empty grid background variation:
  - img/backgroundCube0.png through img/backgroundCube9.png
- Each placed cube receives a randomized baseCube texture.
- Each empty grid slot receives a randomized backgroundCube texture at game start.
- Shatter particles use the same randomized occupied texture.

Replace the placeholder PNG/WAV files with final production assets using the same filenames.
Run by opening index.html in a browser.

V5 change:
- Piece containers are now transparent, so irregular shapes no longer show a visible rectangular backing.

V6 change:
- The game now starts with 3 possible block colors.
- Every 500 points unlocks one more possible color until all configured colors are available.
- HUD now displays the number of currently unlocked colors.

V7 change:
- Added animated dopamine-style game-over results screen.
- Shows final score, high score, praise text, confetti, and special new-high-score treatment.
- Added gameover.wav placeholder SFX.

V8 change:
- Fixed premature game-over after placing a piece that clears a line.
- Remaining-piece fit checks now run after cleared cells are actually removed from the board.

V9 change:
- Added favicon link: place favicon.png in the project root next to index.html.
- Game now starts with 2 colors.
- Color unlock interval changed from 500 points to 300 points.
- Color unlock order is Red, Green, Blue, Yellow, Purple, Orange, Teal, Brown, Pink.
- After the named color list is fully unlocked, random HSL colors can appear.

V10 change:
- Added Help button to the main menu.
- Added Help screen explaining controls, pieces, scoring, colors, combos, and game over.
- Added Patreon logo link below the game table/pieces area.
- Expected Patreon logo path: img/patreon.png
- Link target: https://www.patreon.com/bishiba

V11 change:
- Added complexity ratings to every shape.
- Added weighted spawning based on complexity.
- Complexity 1 pieces are common.
- Complexity 2 pieces are uncommon.
- Complexity 3 pieces are rarer.
- Complexity 4 pieces are rare.
- Complexity 5 pieces are very rare.
- No scoring changes were added.

V12 change:
- Added achievements with unlock toasts and localStorage persistence.
- Added visible combo meter with praise text and draining behavior.
- Added Stats screen from the main menu.
- Added lifetime stats: games played, high score, highest combo, total lines, perfect lines, blocks placed, pieces placed, 3x3 pieces placed.
- Added lifetime rank based on total lines cleared.
- No complexity-based scoring was added.

V13 change:
- Improved mouse + touch compatibility using Pointer Events.
- Mouse still requires left click.
- Touch/stylus drags are supported without fighting mouse input.
- Only one active pointer can drag at a time, preventing multi-touch conflicts.
- Touch dragging lifts the visual piece above the finger while keeping the preview under the pointer.
- Disabled unwanted page scrolling/selection/tap highlight during gameplay.
- Added mobile viewport settings to reduce accidental zoom.
- Added optional haptic feedback on supported mobile browsers.

V14 change:
- Added Firebase-ready leaderboard architecture.
- Added local leaderboard using localStorage.
- Added pending score queue for offline play.
- Added player name storage.
- Added Leaderboard screen from main menu.
- Added leaderboard.js adapter layer.
- Added firebase.js with step-by-step setup comments.
- Firebase is disabled by default; game remains fully offline.

V15 change:
- Scrollbars are visually hidden while preserving scrollable content.
- Back buttons in non-game menus/cards are positioned top-left.
- Escape key now returns to the main menu from all screens.
- Escape cancels an active drag before navigating away.

V16 change:
- Spawned pieces now sit on the left side of the play area on desktop/tablet layouts.
- Game layout is more compact vertically.
- Margins/gaps around header, combo meter, board, pieces, and Patreon link were reduced.
- Narrow mobile screens still use the stacked layout.

V17 change:
- Added treasure tiles with golden dust overlay.
- At most one tile in a spawned complex square can be a treasure tile.
- Treasure tiles only pay out when cleared/popped by a line clear.
- Each treasure tile popped adds +1x to the current action multiplier.
  Example: 3-line clear with 2 treasure tiles = 3x total action value.
- Added treasure stats to the Stats screen.
- Added treasure achievements.

V18 change:
- Music is now enabled by default for new players.
- Added safer audio unlock on first pointer/key interaction for browser autoplay restrictions.
- Added explicit full-board-clear handling.
- Clearing the entire board now gives BOARD WIPE +250 bonus, confetti, haptics, and massive SFX.
- Added board clear stats and achievements.

V19 change:
- Added board-clear rainbow animation.
- On full board clear, the empty board is briefly filled with animated rainbow glowing blocks, then detonates visually.
- Board-clear animation is cosmetic; the +250 board wipe bonus is still awarded once.
- Added extra board-clear achievements:
  - Perfectionist: 25 board clears.
  - Chromablast Ascendant: 100 board clears.
- Added cheat code: type "new" during gameplay to reroll currently available unplaced pieces.

V21 change:
- Added Credits button to the main menu.
- Added Credits screen.
- Credited game creator: Henrik Lindholm.
- Added uploaded Pixabay music tracks to audio folder.
- Replaced placeholder music list with the uploaded MP3 tracks.
- Music now shuffles randomly and avoids immediately repeating the previous track.

V22 change:
- Perfect same-color line clears no longer use a flat 2x value.
- Perfect-color line value now scales with currently available color count.
- Example: 2 colors unlocked = 2x, 5 colors unlocked = 5x, 9 colors unlocked = 9x.
- This makes perfect-color lines properly rewarding as they become harder to create.

V23 change:
- Added rare Rainbow Pieces for Endless.
- The entire complex square becomes rainbow, not just one tile.
- Rainbow blocks count as any color when checking perfect-color lines.
- Rainbow pieces do not spawn treasure tiles, keeping both mechanics visually readable.
- Added rainbow-piece stats and achievements.

V24 change:
- Added mode select: Play -> Endless or Adventure.
- Endless is the previous core game mode.
- Added Adventure level select.
- Added levels folder with JSON levels and manifest.
- Added Adventure progress saved in localStorage.
- Added Adventure scoring by moves and 1-3 star ratings.
- Added move-limited levels with preset piece queues.
- Added Adventure objective blocks.
- Added steel-frame blocks: first clear removes steel frame, second clear removes block.
- Added color-locked blocks: only clear through matching perfect-color lines.
- Adventure level JSON files are in /levels/.

V25 change:
- Added detailed console logs for Adventure level loading and rendering.
- If running from file://, Adventure now immediately uses embedded fallback levels.
- If JSON loading fails, Adventure logs the exact failure and uses embedded fallback levels.
- Embedded fallback now contains all sample levels, not just level001.
- openLevelSelect() now guarantees levels exist before rendering.

V26 change:
- Replaced Adventure sample levels with a designed 10-level tutorial campaign.
- Added 1x1 shape for Adventure tutorial levels.
- Levels 1-3 teach basic line clearing and move limits.
- Levels 4-5 teach steel blocks.
- Levels 6-7 teach color-locked blocks and wrong-color failure.
- Level 8 combines steel and color locks.
- Level 9 teaches dual objectives.
- Level 10 is a small gatekeeper challenge.
- Embedded fallback now contains all 10 levels.

V27 change:
- Added first-run username prompt.
- Username is stored in localStorage.
- Leaderboard submissions use the stored player name through ChromablockLeaderboard.
- Username can still be changed later in the Leaderboard screen.

V28 change:
- Online leaderboard submissions now require Firebase Google Auth.
- Leaderboard reads remain public.
- Local/offline scores still work without sign-in.
- Pending scores sync only after Google sign-in.
- Online playerName comes from Google displayName, not user input.
- Online submissions include Firebase Auth uid.
- Updated firebase.js setup comments and suggested Firestore Security Rules.
- Added Sign in with Google / Sign out buttons to the Leaderboard screen.

V29 change:
- Added Firebase SDK script tags to index.html.
- Added your Firebase project config to firebase.js.
- Enabled Firebase leaderboard by default.
- Added Firestore SDK availability check.
- Added Firebase/Auth console logs.
- Added FIREBASE_SETUP.txt with required console setup and suggested rules.

V30 change:
- Game-over screen now has leaderboard status.
- If signed out after losing, the game offers Google sign-in to upload the saved score.
- If signed in, the game shows the player's approximate online leaderboard position.
- Added helper to submit the pending game-over score after login.
- Added online rank calculation based on number of scores higher than final score.

V31 change:
- 1x1 pieces are now excluded from Endless random spawning.
- 1x1 pieces remain available for Adventure preset/tutorial levels.
- Added randomized tile glints.
- Glints can appear on board tiles and available piece tiles.
- Added four glint animation variants: sweep, pulse, star, and ring.

V32 change:
- Online leaderboard now stores only one document per signed-in user.
- Firestore document ID is the Firebase Auth uid.
- Online score only writes when the new score beats the user's existing online high score.
- New online high score replaces the old online score.
- Pending offline queue now keeps only the best pending score instead of every run.
- This prevents a player from filling the leaderboard and reduces Firestore writes on the free tier.
- Updated FIREBASE_SETUP.txt with stricter best-score-per-user Firestore rules.

V33 change:
- Removed scripted visible white borders from normal filled blocks.
- Steel blocks now use img/steelFrame.png as an untinted overlay.
- Color-locked blocks now use img/colorBlock.png as an overlay.
- Added fallback steelFrame.png and colorBlock.png assets if not supplied.
- Spawned pieces now store per-tile baseCube variants.
- When a piece is placed, each tile keeps the exact baseCube texture it had in the spawn area.

V34 change:
- Kept the diagonal sweep glint as CSS.
- Replaced the other glint variants with image-based overlays.
- Added img/glint0.png through img/glint4.png.
- Glints now choose mostly diagonal sweeps, with occasional image sparkle overlays.
- Treasure and rainbow tiles now receive extra glint chances.

V35 change:
- Google Auth now verifies identity, but does not force the public leaderboard name.
- Added public leaderboard name field.
- Players can choose a pseudonym before uploading scores.
- Public leaderboard name is stored locally and submitted with high scores.
- Google email is still never stored or shown.
- Updated setup notes: Firestore rules should validate uid, but allow chosen playerName.

V36: Added provided title.png and favicon.png. Enlarged title area. Combo bar intended to contain HOT STREAK and multiplier directly.

V37 change:
- Patched the actual combo-meter DOM.
- Moved Combo Ready/Hot Streak text and xN multiplier inside the bar.
- Removed the outer combo panel visual border/background.
- Enlarged the in-game title image.
- Confirmed favicon path uses img/favicon.png.

V38 change:
- Added uploaded backgroundCube0.png through backgroundCube9.png.
- Replaced/added baseCube0.png through baseCube9.png with the uploaded gem cube assets.
- Existing random texture systems will use these assets automatically.

V39 change:
- Replaced steelFrame.png with uploaded steel frame.
- Replaced colorBlock.png with uploaded color-lock frame.
- Replaced glint0-4.png with uploaded sparkle assets.

V40 change:
- Fixed online leaderboard name source.
- Saving the public leaderboard name now updates both publicLeaderboardName and playerName localStorage values.
- Leaderboard create/update payloads now force playerName from the saved public leaderboard name.
- Google Auth remains the identity proof; Google displayName is not used for public leaderboard names.

V41 change:
- Removed visible "Online leaderboard" status strip from the Leaderboard screen.
- Online/Local buttons now behave as tabs.
- Active tab turns white.
- Inactive tab remains cyan.
- Existing leaderboard status element remains hidden in DOM to avoid breaking older JS calls.

V42 change:
- Back to Main Menu buttons converted to compact red circular arrow buttons.
- Global title image appears at the top center on menu/detail pages.
- Game screen keeps its own in-game title placement.
- Options menu now uses a consistent container/card.
- Patreon link is global, unframed, and uses donation-oriented text.
- Old framed Patreon link hidden.
- Main menu shows player/public name above Play, or a Login button if no name exists.
- Scrollable containers now show up/down scroll indicators when relevant.
- Online leaderboard display limited to top 25.
- If signed-in player is outside top 25, their rank/score appears beside leaderboard tabs.

V43 change:
- Fixed line-clearing logic to only evaluate rows/columns touched by the piece just placed.
- This prevents unrelated pre-filled Adventure lines from clearing when placing elsewhere.
- Preview line-clearing now also only checks touched rows/columns.

V44 change:
- In Adventure mode, the combo bar now displays the current level hint.
- Normal combo text/fill/multiplier are hidden in Adventure.
- Endless mode keeps the normal combo meter.

V45 change:
- Added Adventure campaign structure with 100 level JSON files.
- Renamed levels to category-based IDs: level-categoryName-01 style.
- Existing Introduction levels are now level-introduction-01 through level-introduction-10.
- Added template/disabled levels for the rest of the 100-level campaign.
- Added campaign categories: Introduction, Beginner, Steelworks, Color Locks, Precision, Legend.
- Level select now displays categories with a 4-column level grid.
- Levels are locked unless the previous level is completed.
- Template levels are visible but disabled.
- Adventure progress saves new IDs and mirrors legacy IDs for compatibility.

V46 change:
- Adventure completion now shows a dopamine-style star result overlay.
- Adventure completion offers Next Level when available, plus Adventure Map.
- Adventure failure no longer returns to level select automatically.
- Adventure failure now prompts Retry over the visible board.
- Endless game-over screen now waits 1 second before appearing.
- Game-over overlays float over the still-visible board instead of immediately hiding game context.

V47 change:
- Global title logo no longer overlaps card headings/content.
- Global title is smaller and positioned as top page branding.
- Non-game screens now reserve vertical space for the title.
- Back buttons are smaller red circles using a matching left-arrow glyph.
- Back arrow is centered and less likely to overlap headings.
- Scroll arrows now bounce subtly.
- Patreon link is slightly smaller/lower so it interferes less with content.

V48 change:
- Removed duplicate hard-coded title logos from Main Menu and Mode Select.
- Wrapped Adventure/Endless mode select in a proper container/card.
- Reworked in-game header so title and stats no longer overlap.
- Added larger bottom spacing so content does not fall under the Patreon link.
- Added category completion achievements.
- Added category 3-star achievements.
- Added full Adventure campaign completion achievement.
- Added full Adventure campaign 3-star achievement.

V49 change:
- Fixed Adventure hint leaking into Endless combo meter.
- Starting Endless now clears currentAdventureLevel and removes adventure-mode styling.
- Returning to menu also clears Adventure hint state.

V50-from-uploaded-v49 change:
- Fixed startup crash: removed stray currentAdventureLevel assignment before its let declaration.
- startEndlessGame now clears Adventure hint state after globals are initialized.
- clearAdventureHintBar is safe and does not depend on currentAdventureLevel.

V51 change:
- Fixed crash: achievement.test is not a function.
- Removed manual Adventure category/campaign achievements from automatic test-based ACHIEVEMENTS array.
- Added MANUAL_ACHIEVEMENTS metadata.
- Added unlockAchievement(id) for manual Adventure achievements.
- checkAchievements is now defensive and skips malformed achievement objects instead of crashing gameplay.

V52 change:
- Mode selection screen is now wrapped in a mode-select-card container.
- Game board header now has a regular text navigation button on the left.
- Game board header title logo is centered.
- Score/stat panel is aligned to the right of the title.
- Endless mode game header button says Main Menu.
- Adventure mode game header button says Level Select.
- Red circular back button is not used on the game board.

V54 change:
- Fixed scroll-up arrow placement so it appears at the top of the scrollable container.
- Scroll-down arrow remains at the bottom of the container.
- Non-game screens now reserve bottom space for the Patreon link.
- Menu/detail containers are bounded to the visible viewport and scroll internally instead of extending below the screen.

V55 change:
- Stronger CSS override for Endless game-over transparency.
- Removed background, border, shadow, blur, and pseudo-element panel effects from #gameOverScreen and .gameover-card.
- Board remains visible behind Endless game-over contents.

V56 real implementation:
- Fixed Adventure ESC/result overlay persistence: leaving the game screen or pressing ESC clears pending Adventure win/loss overlays.
- Starting Adventure or Endless clears old result overlay state.
- Game board header now aligns inside the board's perceived frame.
- Left game button is Main Menu in Endless and Level Select in Adventure.
- Removed red circular back button from game board.
- Enlarged and centered game-board title logo.
- Stats panel aligned to the right inside the same header width.

V57 change:
- Music now starts after the first pointer/key interaction even when the player is on the main menu.
- Music continues through menu screens instead of only starting in gameplay.
- Returning to Main Menu no longer stops music.
- Toggling Music on/off in Options starts/stops music immediately when audio is unlocked.

V58 change:
- Fixed scroll indicators being always visible by making .hidden override the scroll indicator display rules.
- updateScrollIndicators now hides indicators before measuring scrollability so the arrows do not create their own scroll state.
- Added resize refresh for scroll indicators.
- Reverted game combo bar to its intended width.
- Header now aligns its left button and right stats panel to the combo bar edges instead of stretching the combo bar to the header.

V59 change:
- Fixed Endless game-over screen still appearing non-transparent.
- Removed broad stacked text-shadow rule from all div/span children.
- Added final high-specificity CSS override to remove all game-over panel backgrounds, blur, box-shadow, pseudo-elements, and glow layers.
- Kept only small text shadows on actual text elements for readability.

V60 change:
- Remade Endless game-over flow.
- Endless no longer calls showScreen("over"), so the game board stays active and visible.
- Game-over overlay is now a transparent fixed overlay with only text/buttons.
- Removed gameover-burst/strobe and old card panel behavior for Endless overlay.

V61 change:
- Replaced sticky scroll arrows with absolute overlay arrows.
- Up arrow is physically pinned to top: 8px of the scrollable container.
- Down arrow is physically pinned to bottom: 8px of the scrollable container.
- Arrows no longer affect scrollHeight, so they cannot create their own scroll state.

V62 change:
- Fixed scroll arrows drifting while scrolling.
- Up arrow is now prepended as the first child and uses sticky top.
- Down arrow is appended as the last child and uses sticky bottom.
- This keeps arrows pinned to the top/bottom of the scrollable container while scrolling.

V65 change:
- Restored all normal red return buttons by using v63 as the base.
- Removed only the red return button inside the Endless game-over screen.
- Added scoped CSS safeguard for #gameOverScreen only.
