# Generated from local PostgreSQL database dump
from django.db import migrations

DATA = {'categories': [{'description': 'Libertad total de creaci├│n, exploraci├│n y f├¡sicas interactivas.',
                 'id': 43,
                 'image_url': None,
                 'name': 'Sandbox & Mundo Abierto',
                 'slug': 'sandbox-mundo-abierto'},
                {'description': 'G├®nero oficial de RAWG: Action',
                 'id': 46,
                 'image_url': None,
                 'name': 'Action',
                 'slug': 'action'},
                {'description': 'G├®nero oficial de RAWG: Simulation',
                 'id': 47,
                 'image_url': None,
                 'name': 'Simulation',
                 'slug': 'simulation'},
                {'description': 'G├®nero oficial de RAWG: Indie',
                 'id': 50,
                 'image_url': None,
                 'name': 'Indie',
                 'slug': 'indie'},
                {'description': 'G├®nero oficial de RAWG: Fighting',
                 'id': 51,
                 'image_url': None,
                 'name': 'Fighting',
                 'slug': 'fighting'},
                {'description': 'G├®nero oficial de RAWG: Shooter',
                 'id': 52,
                 'image_url': None,
                 'name': 'Shooter',
                 'slug': 'shooter'},
                {'description': 'G├®nero oficial de RAWG: Strategy',
                 'id': 53,
                 'image_url': None,
                 'name': 'Strategy',
                 'slug': 'strategy'},
                {'description': 'G├®nero oficial de RAWG: Sports',
                 'id': 54,
                 'image_url': None,
                 'name': 'Sports',
                 'slug': 'sports'},
                {'description': 'Juegos de rol occidentales, JRPGs cl├ísicos y experiencias narrativas con '
                                'progresi├│n.',
                 'id': 34,
                 'image_url': None,
                 'name': 'RPG / Rol',
                 'slug': 'rpg-rol'},
                {'description': 'Juegos de disparos en primera y tercera persona, t├ícticos y arenas.',
                 'id': 35,
                 'image_url': None,
                 'name': 'Shooter / FPS',
                 'slug': 'shooter-fps'},
                {'description': 'Exploraci├│n, combate, mundos abiertos y narrativas cinematogr├íficas.',
                 'id': 36,
                 'image_url': None,
                 'name': 'Acci├│n & Aventura',
                 'slug': 'accion-aventura'},
                {'description': 'Juegos de miedo, atm├│sfera opresiva y supervivencia extrema.',
                 'id': 37,
                 'image_url': None,
                 'name': 'Terror & Survival',
                 'slug': 'terror-survival'},
                {'description': 'Joyas independientes, ideas creativas y mec├ínicas originales.',
                 'id': 38,
                 'image_url': None,
                 'name': 'Indie Games',
                 'slug': 'indie-games'},
                {'description': 'T├íctica, gesti├│n de recursos, construcci├│n y estrategia en tiempo real.',
                 'id': 39,
                 'image_url': None,
                 'name': 'Estrategia & Simulaci├│n',
                 'slug': 'estrategia-simulacion'},
                {'description': 'Supervivencia multijugador masiva en zonas de combate din├ímicas.',
                 'id': 40,
                 'image_url': None,
                 'name': 'Battle Royale',
                 'slug': 'battle-royale'},
                {'description': 'F├║tbol, b├ísquet, simulaci├│n deportiva y automovilismo.',
                 'id': 41,
                 'image_url': None,
                 'name': 'Deportes & Carreras',
                 'slug': 'deportes-carreras'},
                {'description': 'Saltos de precisi├│n, metroidvanias cl├ísicos y combate versus 1v1.',
                 'id': 42,
                 'image_url': None,
                 'name': 'Plataformas & Lucha',
                 'slug': 'plataformas-lucha'},
                {'description': 'G├®nero oficial de RAWG: Arcade',
                 'id': 48,
                 'image_url': None,
                 'name': 'Arcade',
                 'slug': 'arcade'},
                {'description': 'G├®nero oficial de RAWG: Massively Multiplayer',
                 'id': 49,
                 'image_url': None,
                 'name': 'Massively Multiplayer',
                 'slug': 'massively-multiplayer'},
                {'description': 'G├®nero oficial de RAWG: Platformer',
                 'id': 55,
                 'image_url': None,
                 'name': 'Platformer',
                 'slug': 'platformer'},
                {'description': 'G├®nero oficial de RAWG: RPG',
                 'id': 56,
                 'image_url': None,
                 'name': 'RPG',
                 'slug': 'role-playing-games-rpg'},
                {'description': 'G├®nero oficial de RAWG: Adventure',
                 'id': 57,
                 'image_url': None,
                 'name': 'Adventure',
                 'slug': 'adventure'},
                {'description': 'G├®nero: Racing', 'id': 58, 'image_url': None, 'name': 'Racing', 'slug': 'racing'},
                {'description': 'G├®nero: Puzzle', 'id': 59, 'image_url': None, 'name': 'Puzzle', 'slug': 'puzzle'}],
 'comments': [],
 'game_genres': [{'category_id': 46, 'game_id': 2},
                 {'category_id': 47, 'game_id': 2},
                 {'category_id': 48, 'game_id': 2},
                 {'category_id': 49, 'game_id': 2},
                 {'category_id': 50, 'game_id': 2},
                 {'category_id': 46, 'game_id': 3},
                 {'category_id': 51, 'game_id': 3},
                 {'category_id': 46, 'game_id': 5},
                 {'category_id': 52, 'game_id': 5},
                 {'category_id': 53, 'game_id': 5},
                 {'category_id': 47, 'game_id': 6},
                 {'category_id': 54, 'game_id': 6},
                 {'category_id': 46, 'game_id': 7},
                 {'category_id': 52, 'game_id': 8},
                 {'category_id': 46, 'game_id': 9},
                 {'category_id': 50, 'game_id': 9},
                 {'category_id': 55, 'game_id': 9},
                 {'category_id': 46, 'game_id': 11},
                 {'category_id': 55, 'game_id': 12},
                 {'category_id': 46, 'game_id': 14},
                 {'category_id': 56, 'game_id': 14},
                 {'category_id': 53, 'game_id': 14},
                 {'category_id': 46, 'game_id': 15},
                 {'category_id': 57, 'game_id': 15},
                 {'category_id': 56, 'game_id': 15},
                 {'category_id': 46, 'game_id': 16},
                 {'category_id': 52, 'game_id': 16},
                 {'category_id': 53, 'game_id': 16},
                 {'category_id': 46, 'game_id': 17},
                 {'category_id': 52, 'game_id': 17},
                 {'category_id': 56, 'game_id': 17},
                 {'category_id': 46, 'game_id': 4},
                 {'category_id': 56, 'game_id': 4},
                 {'category_id': 46, 'game_id': 1},
                 {'category_id': 46, 'game_id': 18},
                 {'category_id': 56, 'game_id': 18},
                 {'category_id': 46, 'game_id': 19},
                 {'category_id': 56, 'game_id': 19},
                 {'category_id': 53, 'game_id': 22},
                 {'category_id': 54, 'game_id': 23},
                 {'category_id': 58, 'game_id': 23},
                 {'category_id': 50, 'game_id': 23},
                 {'category_id': 46, 'game_id': 24},
                 {'category_id': 56, 'game_id': 24},
                 {'category_id': 46, 'game_id': 25},
                 {'category_id': 57, 'game_id': 25},
                 {'category_id': 50, 'game_id': 25},
                 {'category_id': 57, 'game_id': 26},
                 {'category_id': 56, 'game_id': 26},
                 {'category_id': 50, 'game_id': 26},
                 {'category_id': 48, 'game_id': 27},
                 {'category_id': 55, 'game_id': 27}],
 'games': [{'description': 'League of Legends is a fast-paced, competitive online game that blends the speed and '
                           'intensity of an RTS with RPG elements. Two teams of powerful champions, each with a unique '
                           'design and playstyle, battle head-to-head across multiple battlefields and game modes. '
                           'With an ever-expanding roster of champions, frequent updates and a thriving tournament '
                           'scene, League of Legends offers endless replayability for players of every skill level.',
            'id': 14,
            'image_url': 'https://media.rawg.io/media/games/78b/78bc81e247fc7e77af700cbd632a9297.jpg',
            'name': 'League of Legends',
            'slug': 'league-of-legends'},
           {'description': 'The Golden Order has been broken.\n'
                           '\n'
                           'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become '
                           'an Elden Lord in the Lands Between.\n'
                           '\n'
                           'In the Lands Between ruled by Queen Marika the Eternal, the Elden Ring, the source of the '
                           'Erdtree, has been shattered.\n'
                           '\n'
                           "Marika's offspring, demigods all, claimed the shards of the Elden Ring known as the Great "
                           'Runes, and the mad taint of their newfound strength triggered a war: The Shattering. A war '
                           'that meant abandonment by the Greater Will.\n'
                           '\n'
                           'And now the guidance of grace will be brought to the Tarnished who were spurned by the '
                           'grace of gold and exiled from the Lands Between. Ye dead who yet live, your grace long '
                           'lost, follow the path to the Lands Between beyond the foggy sea to stand before the Elden '
                           'Ring.',
            'id': 4,
            'image_url': 'https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg',
            'name': 'Elden Ring',
            'slug': 'elden-ring'},
           {'description': 'VALORANT is your global competitive stage. ItÔÇÖs a 5v5 tac-shooter matchup to plant or '
                           'defuse the Spike in a one-life-per-round, first to 13 series. More than guns and bullets, '
                           'youÔÇÖll choose an Agent armed with adaptive, swift, and lethal abilities that create '
                           'opportunities to let your gunplay shine.\r\n'
                           '\r\n'
                           'Creativity is your greatest weapon.\r\n'
                           '\r\n'
                           '## The Agents\r\n'
                           '\r\n'
                           'Agents and their signature abilities are how you win with skill and style. Adapt and '
                           'outplay in the role of either a Duelist, Initiator, Controller, or Sentinel.\r\n'
                           '\r\n'
                           '## The Maps\r\n'
                           '\r\n'
                           'Haven. Bind. Split. Ascent. Each a stage for a multitude of savvy plays, agent clutches, '
                           'and team strategies.\r\n'
                           'Unique with their own strategic environment',
            'id': 5,
            'image_url': 'https://media.rawg.io/media/games/b11/b11127b9ee3c3701bd15b9af3286d20e.jpg',
            'name': 'Valorant',
            'slug': 'valorant'},
           {'description': 'EA SPORTS FCÔäó 25 gives you more ways to win for the club. Team up with friends in your '
                           'favourite modes with the new 5v5 Rush, and manage your club to victory as FC IQ delivers '
                           'more tactical control than ever before.',
            'id': 6,
            'image_url': 'https://media.rawg.io/media/screenshots/928/9289953b354ac641e3f1b83d43e18521.jpg',
            'name': 'EA SPORTS FC 25',
            'slug': 'ea-sports-fc-25'},
           {'description': 'Welcome to Warzone, the new massive combat arena within Call of Duty┬«: Modern Warfare┬«, '
                           'free for everyone.\n'
                           '\n'
                           'Drop In\n'
                           'Join forces with your friends and jump into a battleground with up to 150 players.\n'
                           '\n'
                           'Loot For Rewards\n'
                           'Discover supply boxes and complete contracts to build your arsenal and gain a tactical '
                           'advantage.\n'
                           '\n'
                           'Battle Across Two Epic Modes\n'
                           'Experience a new way to ÔÇÿBattle RoyaleÔÇÖ or play ÔÇÿPlunderÔÇÖ in a race to earn '
                           '$1,000,000 of in-match Cash.',
            'id': 8,
            'image_url': 'https://media.rawg.io/media/games/7e3/7e327a055bedb9b6d1be86593bef473d.jpg',
            'name': 'Call of Duty: Warzone',
            'slug': 'call-of-duty-warzone'},
           {'description': 'Grand Theft Auto VI is an upcoming action-adventure game developed and published by '
                           'Rockstar Games. It is due to be the eighth main Grand Theft Auto game, following Grand '
                           'Theft Auto V (2013), and the sixteenth entry overall. Set within the fictional US state of '
                           'Leonida, based on Florida, the story follows the romantic criminal duo of Jason Duval and '
                           "Lucia Caminos. Players will be able to freely roam Leonida's open world, which features "
                           'the Miami-inspired Vice City.',
            'id': 1,
            'image_url': 'https://media.rawg.io/media/games/734/7342a1cd82c8997ec620084ae4c2e7e4.jpg',
            'name': 'Grand Theft Auto VI',
            'slug': 'grand-theft-aito-vi'},
           {'description': 'This is the original mario brothers┬áexcept its written in jar',
            'id': 12,
            'image_url': 'https://media.rawg.io/media/screenshots/2d8/2d85b588d329dc747f2d0a34506f3633.jpg',
            'name': 'Super mario',
            'slug': 'super-mario'},
           {'description': 'play games for free an gun games for every o ne',
            'id': 3,
            'image_url': 'https://media.rawg.io/media/screenshots/7b2/7b2920260f974292970d6c2312991a3d.jpg',
            'name': 'counter strike',
            'slug': 'counter-strike-2'},
           {'description': 'Unleash the power of the Gods and embark on a merciless quest as Kratos, an ex-Spartan '
                           'warrior driven to destroy Ares, the God of War. Armed with lethal double chainblades, '
                           "Kratos must carve through mythology's darkest creatures including Medusa, Cyclops, the "
                           'Hydra and more, while solving intricate puzzles in breathtaking environments. Driven by '
                           'pure revenge, nothing can stop Kratos from achieving absolution.',
            'id': 7,
            'image_url': 'https://media.rawg.io/media/games/1aa/1aa4ca34a8a6bb57a2e065c8332dc230.jpg',
            'name': 'God of War I',
            'slug': 'god-of-war'},
           {'description': 'One of the most popular games of the 2010s, Minecraft allows you to rebuild the '
                           'environment around you. The world of the game is open, infinitely wide, and procedurally '
                           'generated. It is composed of small 3D cubes that represent specific types of materials or '
                           'terrain. The gameplay is centered on mining and building various structures of your '
                           "choice. You can also craft items like tools, weapons, and armor. There's an option to "
                           'shift to the first or the third person view.\n'
                           'Minecraft includes multiple modes that dramatically change the focus of the game. Survival '
                           'and Adventure modes require the player to gather resources, hunt for food and fight '
                           'monsters to survive. In the Hardcore mode, thereÔÇÖs even permanent death. Creative mode, '
                           'by contrast, offers you to freely explore the world and construct whatever you want with '
                           'unlimited resources. ThereÔÇÖs also a multiplayer mode that allows the players to share '
                           'their worlds and engage in the traditional MMO activities, such as player-vs-player '
                           'combat.\n'
                           'MinecraftÔÇÖs crude visual style, reminiscent of Lego cubes, became an iconic part of the '
                           'popular culture. There are many myths and fan fiction surrounding the game, such as the '
                           'legend of Herobrine, a rumored character that officially doesnÔÇÖt exist.',
            'id': 2,
            'image_url': 'https://media.rawg.io/media/games/b4e/b4e4c73d5aa4ec66bbf75375c4847a2b.jpg',
            'name': 'Minecraft',
            'slug': 'minecraft'},
           {'description': 'Hollow Knight is a Metroidvania-type game developed by an indie studio named Team '
                           'Cherry.\r\n'
                           '\r\n'
                           "Most of the game's story is told through the in-world items, tablets, and thoughts of "
                           'other characters. Many plot aspects are told to the player indirectly or through the '
                           'secret areas that provide a bit of lore in addition to an upgrade. At the beginning of the '
                           'game, the player visits a town of Dirtmouth. A town built above the ruins of Hallownest. '
                           'The players descend down into the ruins to find some answers to his questions.\r\n'
                           '\r\n'
                           'The game revolves mainly around the exploration of the in-game world, which requires the '
                           'players to have some platforming skills. The players have to find secrets that are '
                           'scattered around the level and battle their enemies. There is a certain degree of '
                           'backtracking in the game as some areas are locked until the player defeats a certain boss '
                           'or picks up a specific item. Each area changes as the plot advances so it may be '
                           'surprising to come back in a certain area. \r\n'
                           '\r\n'
                           'The Protagonist uses a nail which serves as a replacement for a sword. Players can attack '
                           'in four directions. The nail is upgradable.',
            'id': 9,
            'image_url': 'https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg',
            'name': 'Hollow Knight',
            'slug': 'hollow-knight'},
           {'description': "Ganon, the King of Evil, has broken free of the Dark World and has captured Hyrule's "
                           'beloved Princess Zelda. But, before she was caught, Zelda managed to shatter the Triforce '
                           'of Wisdom and scatter its eight pieces throughout Hyrule. You begin your adventure by '
                           'finding a small wooden sword in a dark cave. Then, as you grow in stature, experience, and '
                           'strength, so do your weapons. Help Link collect the captured pieces of the Triforce, '
                           'rescue the princess, and thwart GanonÔÇÖs evil plans!\r\n'
                           '\r\n'
                           'The epic series The Legend of Zelda began here, with the heroic Link on a hazardous '
                           'journey through the fantastic world of Hyrule. Using your sword, your shield and your '
                           'wits, retrieve the eight fragments of the Triforce and save Princess Zelda.\r\n'
                           '\r\n'
                           'This groundbreaking game introduced innovative ideas that are still present in Zelda games '
                           "more than 25 years later. Not only is Link's original adventure action-packed, it also "
                           'features puzzling dungeons to explore and a myriad of secrets to discover.',
            'id': 15,
            'image_url': 'https://media.rawg.io/media/games/f87/f87de0e93f02007fd044e4bf04d453d8.jpg',
            'name': 'The Legend of Zelda',
            'slug': 'the-legend-of-zelda'},
           {'description': 'Fortnite is a survival simulator with an open world.\n'
                           '\n'
                           'The primary goal of the game is to collect resources and then try to survive at day and '
                           'night directly. Players will gather in teams to collect items that they can use to build a '
                           'Fort during the day and to defend against zombies at night. Construction will be the main '
                           'mechanics, a lot of items will be in the game. Players can build and edit each wall of '
                           'their Fort, build stairs, roof and windows, sculpting them according to a particular need. '
                           'The terrain and map in the game are randomly generated, and players are given various '
                           'ranged weapons (like a sniper rifle) as well as edged weapons (like a katana). You can '
                           'also create weapons, and character skills can be customised through upgrades.\n'
                           '\n'
                           'The game features four different classes: ninja, alien, commando, and builder. Different '
                           'classes have different abilities. For example, the builder builds faster and cheaper, and '
                           'also strengthens the buildings themselves. And the ability to melee is much better in the '
                           'ninja class than in other classes. Players can also destroy environment objects and '
                           'scenery to get resources.',
            'id': 16,
            'image_url': 'https://media.rawg.io/media/games/d97/d97f663b752a6484df105993f17abb49.jpg',
            'name': 'Fortnite: Save The World',
            'slug': 'fortnite'},
           {'description': 'America, 1899. The end of the wild west era has begun as lawmen hunt down the last '
                           'remaining outlaw gangs. Those who will not surrender or succumb are killed. \r\n'
                           '\r\n'
                           'After a robbery goes badly wrong in the western town of Blackwater, Arthur Morgan and the '
                           'Van der Linde gang are forced to flee. With federal agents and the best bounty hunters in '
                           'the nation massing on their heels, the gang must rob, steal and fight their way across the '
                           'rugged heartland of America in order to survive. As deepening internal divisions threaten '
                           'to tear the gang apart, Arthur must make a choice between his own ideals and loyalty to '
                           'the gang who raised him.\r\n'
                           '\r\n'
                           'From the creators of Grand Theft Auto V and Red Dead Redemption, Red Dead Redemption 2 is '
                           'an epic tale of life in America at the dawn of the modern age.',
            'id': 11,
            'image_url': 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
            'name': 'Red Dead Redemption 2',
            'slug': 'red-dead-redemption-2'},
           {'description': 'Cyberpunk 2077 is a science fiction game loosely based on the role-playing game Cyberpunk '
                           '2020.\r\n'
                           '\r\n'
                           '###Setting\r\n'
                           'The game is set in the year 2077 in a fictional futuristic metropolis Night City in '
                           'California. In the world of the game, there are developed cybernetic augmentations that '
                           "enhance people's strength, agility, and memory. The city is governed by corporations. Many "
                           'jobs are taken over by the robots, leaving a lot of people poor and homeless. Night City '
                           'has a roaring underworld, with black markets, underground surgeons, drug dealers, and '
                           'street gangs abound.\r\n'
                           '\r\n'
                           '###Characters\r\n'
                           'The main protagonist is fully customizable, including his or her sex and appearance, and '
                           'goes by the nickname V. He or she is an underground mercenary who does ÔÇ£dirty '
                           'businessÔÇØ for the various contractors. An NPC companion named Jackie joins the '
                           'protagonist early at the game, and various other companions may join the player on certain '
                           'missions as the plot demands. However, the game has no parties and no companion system.\r\n'
                           '\r\n'
                           '###Gameplay\r\n'
                           'The player controls V from the first person view, with the third-person view used for '
                           'cutscenes only. The protagonist can travel across the city on feet or using various '
                           'vehicles, in a manner some observers compared to GTA series. There are many options for '
                           'the character customization, including three character classes, and a variety of '
                           'augmentations V can install to enhance his or her abilities.',
            'id': 17,
            'image_url': 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg',
            'name': 'Cyberpunk 2077',
            'slug': 'cyberpunk-2077'},
           {'description': 'Sekiro: Shadows Die Twice is a game about a ninja (or shinobi, as they call it), who is '
                           'seeking revenge in the Sengoku era Japan.\n'
                           '\n'
                           '###Plot\n'
                           'The game is set in the 16th century in a fictionalized version of Japan. The main '
                           'protagonist is a member of a shinobi clan. A samurai from the rival Ashina clan captured '
                           "the protagonist's master, and the protagonist himself lost his arm trying to protect his "
                           'leader. However, a sculptor of Buddha statues managed to replace the lost limb with an '
                           'advanced prosthetic arm. The protagonist accepted a new name, Sekiro, meaning ÔÇ£one-armed '
                           'wolfÔÇØ. Now his goal is to avenge his clan and to save his leader from the hands of their '
                           'enemies.\n'
                           '\n'
                           '###Gameplay\n'
                           'The player controls Sekiro from the third person view and navigates the character as he '
                           'fights multiple enemies. Sekiro: Shadows Die Twice features an innovative combat system '
                           "that doesn't use hit points. Instead, the opponents can be killed with a single precision "
                           "strike. However, the player has to fight his or her way through the opponent's blocks and "
                           'parries to land the deadly blow. The main character fights with his sword (katana) in the '
                           'right hand, while his left hand can host a variety of upgrades, such as an ax, a torch, or '
                           'a shield. The game also emphasizes stealth action. The player has to use a grappling hook '
                           'to access multiple locations. Sekiro: Shadows Die Twice has no multiplayer.',
            'id': 18,
            'image_url': 'https://media.rawg.io/media/games/67f/67f62d1f062a6164f57575e0604ee9f6.jpg',
            'name': 'Sekiro: Shadows Die Twice',
            'slug': 'shadows-die-twice'},
           {'description': 'New take in the Souls series. This time players are offered to overcome the immense '
                           'difficulties in the kingdom of Drangleic. On the way to becoming human again, the hero '
                           'must obtain a few greater souls. Gamers will experience player versus environment as well '
                           'as player versus player gameplay using dedicated server technology. Invite your friends, '
                           'fight your foes and survive your way through harsh medieval fantasy land. \n'
                           '\n'
                           'The game shares with the first installment in the series the engine and game universe but '
                           'is not connected in terms of story. Known for its difficulty the game offers players '
                           'unbeatable challenge. Bad play is severely punished by the game: each time player dies '
                           'game protagonist loses a bit of maximum health just like in DemonÔÇÖs Souls.\n'
                           '\n'
                           'Scholar of the First Sin bundles all previous DLCs for Dark Souls II as well as visual '
                           'upgrades, new features and content.',
            'id': 19,
            'image_url': 'https://media.rawg.io/media/games/8fc/8fc59e74133fd8a8a436b7e2d0fb36c2.jpg',
            'name': 'Dark Souls II: Scholar of the First Sin',
            'slug': 'dark-souls-ii-scholar-of-the-first-sin'},
           {'description': 'Metal Fatigue is a real-time strategy game taking the genre to new heights ÔÇô literally! '
                           'Build and customize your massive Combots to dominate the three battlefield levels '
                           'simultaneously - from orbit, to the surface, and even underground!\n'
                           'Develop your base and command your forces carefully - the enemy can appear from any '
                           'direction, including above and below!\n'
                           'Choose from three warring factions - The Milagro, Neuropa or Rimtech are competing '
                           'CorpoNations, each with their own technologies and research capabilities. Capitalize on '
                           'their individual strengths and weaknesses for the optimum strategic advantage!\n'
                           '30 solo play missions - each faction has its own unique ten-mission campaign. Follow the '
                           'story of three estranged brothers, as they scavenge high technology from the ancient alien '
                           'Hedoth to fight a war against their very own bloodline.\n'
                           '30 multiplayer maps and missions - up to eight players supported over LAN. Includes both '
                           'cooperative and death match modes.\n'
                           'Force your enemy to surrender! Launch and airborne assault using hover jets! Destroy the '
                           'menacing threat from above! Overwhelm your enemy with combined arms!',
            'id': 22,
            'image_url': 'https://media.rawg.io/media/screenshots/132/132132a8f27c0a25c05223a19c86a51f.jpg',
            'name': 'Metal Fatigue',
            'slug': 'metal-fatigue'},
           {'description': 'Highly competitive soccer game with rocket-cars is the most comprehensive way to describe '
                           'this game. Technically a sequel to PsyonixÔÇÖ previous game - Supersonic Acrobatic '
                           'Rocket-Powered Battle-Cars; Rocket League successfully became a standalone sensation, that '
                           'can be enjoyed by anyone. Easy to learn, hard to master game mechanics are perfect for the '
                           'tight controls. Players are invited to maneuver the different fields within several game '
                           'modes, from arcade to ranked game either 1v1, or in 2v2 and 3v3 teams. Using boosters will '
                           'not only speed up the car but will allow the car to propel itself into the air.\r\n'
                           'Rocket League provides several levels of customization, where not only the color of your '
                           'car can be adjusted, but the colors and form of the booster flame, different hats, and '
                           'little flags. Or players can pick a completely different car. Collaboration with different '
                           'franchises brought not only original transport but some famous cars, including Batmobile '
                           'or Delorian from Back to the Future.',
            'id': 23,
            'image_url': 'https://media.rawg.io/media/games/8cc/8cce7c0e99dcc43d66c8efd42f9d03e3.jpg',
            'name': 'Rocket League',
            'slug': 'rocket-league'},
           {'description': 'The game takes place in the world of the epic "Star Wars".\r\n'
                           'When creating a character, first select a class - Soldier, Scoundrel or Scout. Classes '
                           'differ in the proportion of strength, health and cunning. Later, three more classes will '
                           'open, each of which will be a Jedi: Jedi Guardian, Jedi Consular, and Jedi Sentinel. This '
                           'will also be the choice in favour of different proportions of strength, intelligence and '
                           'skills.\r\n'
                           'In the world of "Star Wars," there is a Force that can be vested both by the Jedi and by '
                           'their enemies. There are Force Powers of three types: light, dark and neutral. They should '
                           'be studied, this raises the level of skill. Forces are expended but are restored.\r\n'
                           'The player can alternately lean toward both the Light and the Dark Side of the Force - '
                           'this will affect the ending of the game and the use of Force Powers. For example, if the '
                           'character belongs to the Light Side, then the use of the Dark Force will require more of '
                           'this Force from him than using the Light.\r\n'
                           'The hero will visit the underground metropolis, the desert planet, the planet-forest and '
                           'the planet-ocean, caves with crystals for light swords, sand Tatooine, the '
                           'planet-cemetery, space ships and stations.\r\n'
                           'The hero will interact with sentient beings, droids of different classes and exotic '
                           'animals.',
            'id': 24,
            'image_url': 'https://media.rawg.io/media/games/6e0/6e0c19bb111bd4fa20cf0eb72a049519.jpg',
            'name': 'Star Wars: Knights of the Old Republic',
            'slug': 'star-wars-knights-of-the-old-republic-2'},
           {'description': 'Prove your worth!\n'
                           'Are you worthy of entering Valhalla?\n'
                           'You have been sent to Valheim, the 10th Norse world. Only by defeating the mighty beasts '
                           'of these lands will you win the favor of the gods. This quest will take you to the far '
                           'reaches of this world, from the deepest forest to the highest mountain peak. You will '
                           'craft powerful weapons, build unyielding castles and sail longships towards the horizon.\n'
                           '\n'
                           'Description\n'
                           '\n'
                           'Valheim is a game about exploring a huge fantasy world inspired by norse mythology and '
                           'viking culture. You start your adventure at the relatively peaceful center of Valheim. The '
                           'further from the center you travel, the more challenging the world becomes. But you will '
                           'also find more valuable materials that you can use to craft deadlier weapons and sturdier '
                           'armor. You will also build your own viking strongholds and outposts all over the world. '
                           'Eventually you will build a mighty longship and sail the great oceans in search of exotic '
                           'lands ÔÇª but be wary of sailing too far...\n'
                           '\n'
                           'Features:\n'
                           '\n'
                           'Flexible house and base building system.\n'
                           'Intuitive item crafting (weapons, armor, food etc).\n'
                           'Huge procedural world.\n'
                           'Dodge & block based combat system with a wide range of weapons.\n'
                           'Defeat bosses & collect trophies.\n'
                           'Engaging food & health system.\n'
                           'Build & sail ships.\n'
                           'Multiplayer (with focus on cooperation).\n'
                           'Dedicated server.',
            'id': 25,
            'image_url': 'https://media.rawg.io/media/games/adb/adb59be81367b19c2544457424bcf086.jpg',
            'name': 'Valheim',
            'slug': 'valheim'},
           {'description': 'Disco Elysium is a groundbreaking blend of hardboiled cop show and isometric RPG. Solve a '
                           'massive, open ended case in a unique urban fantasy setting. Kick in doors, interrogate '
                           'suspects, or just get lost exploring the gorgeously rendered city of Revachol and '
                           'unraveling its mysteries. Tough choices need to be made. What kind of cop you are ÔÇö is '
                           'up to you.\r\n'
                           '\r\n'
                           'You play a disgraced lieutenant detective in Revachol West, a shore town where '
                           'corruptionÔÇÖs out of control, murders go unsolved, and the kids just wanna dance. Kick in '
                           'doors, interrogate suspects, or get lost exploring a gorgeously rendered city and '
                           'unraveling its mysteries. All the while, tensions rise around you as Revachol threatens to '
                           'explode.\r\n'
                           '\r\n'
                           'Disco ElysiumÔÇÖs completely original skill system makes your innermost feelings, doubts, '
                           'and memories an integral part of every conversation. Level up your rational faculties, '
                           'sharpen your wits, or give in to your basest instincts. What kind of cop you are is up to '
                           'you.',
            'id': 26,
            'image_url': 'https://media.rawg.io/media/games/840/8408ad3811289a6a5830cae60fb0b62a.jpg',
            'name': 'Disco Elysium',
            'slug': 'disco-elysium'},
           {'description': 'Claw is a 2D side-scroller platform video game published by Monolith Productions in 1997 '
                           'about an anthropomorphic pirate cat who sets on a quest to find an ancient amulet while '
                           "fighting enemies and solving puzzles. It is Monolith's second release after Blood, which "
                           'was released that same year in May.',
            'id': 27,
            'image_url': 'https://media.rawg.io/media/games/dee/deeb1bb161d0b9cf8009213df7ff334d.jpg',
            'name': 'Captain Claw',
            'slug': 'claw'}],
 'posts': [{'category_id': 38,
            'content': 'Si les gustan los roguelikes y metroidvanias, les recomiendo mucho Animal Well, Crow Country y '
                       'Nine Sols. Joyas absolutas con gameplay brillante.',
            'created_at': '2026-09-08T19:26:13.467188-03:00',
            'game_id': None,
            'id': 51,
            'is_deleted': False,
            'title': 'Recomendaciones de indies que hayan pasado desapercibidos',
            'user_id': 3},
           {'category_id': None,
            'content': 'Rockstar viene mostrando avances incre├¡bles en f├¡sica del agua, multitudes din├ímicas y '
                       'detalles en Vice City. Sin embargo, con la complejidad de la IA y el tama├▒o del mapa, ┬┐creen '
                       'que llega a fines de 2026 o nos comemos otro delay?',
            'created_at': '2026-09-08T19:26:13.451815-03:00',
            'game_id': 1,
            'id': 44,
            'is_deleted': False,
            'title': '┬┐Creen que GTA VI realmente cumpla todas las expectativas o habr├í retrasos?',
            'user_id': 5},
           {'category_id': None,
            'content': 'Cuando sale un mundito @admin ????',
            'created_at': '2026-10-13T19:52:48.49159-03:00',
            'game_id': 2,
            'id': 57,
            'is_deleted': False,
            'title': 'Mundo de Maikra',
            'user_id': 3},
           {'category_id': None,
            'content': 'Estamos buscando empezar un servidor con mods como Create, Applied Energistics 2 y Mekanism. '
                       '┬┐Recomiendan All the Mods 9 o armar un pack personalizado liviano?',
            'created_at': '2026-09-08T19:26:13.459703-03:00',
            'game_id': 2,
            'id': 47,
            'is_deleted': False,
            'title': '┬┐Cu├íl es el mejor modpack t├®cnico de Minecraft para jugar con amigos?',
            'user_id': 3},
           {'category_id': 34,
            'content': 'Si tuviera que elegir mis 5 RPGs favoritos de todos los tiempos ser├¡an: 1) The Witcher 3, 2) '
                       'Baldurs Gate 3, 3) Fallout: New Vegas, 4) Skyrim, 5) Mass Effect 2. ┬┐Cu├íles son los suyos?',
            'created_at': '2026-09-08T19:26:13.461353-03:00',
            'game_id': None,
            'id': 48,
            'is_deleted': False,
            'title': 'Los mejores RPGs occidentales de la historia: Mi Top 5',
            'user_id': 5},
           {'category_id': None,
            'content': 'Mejor├│ bastante el registro de disparos y los sprays se sienten m├ís consistentes que en el '
                       'lanzamiento. ┬┐Sienten que ya super├│ al 128 tick de CS:GO o todav├¡a le falta pulido a las '
                       'animaciones de muerte?',
            'created_at': '2026-09-08T19:26:13.457984-03:00',
            'game_id': 3,
            'id': 46,
            'is_deleted': False,
            'title': 'El estado del subtick en CS2 tras las ├║ltimas actualizaciones',
            'user_id': 5},
           {'category_id': None,
            'content': 'Emilio, elden ring es un 100, si decis que es un 98 te puedo bancar pero si decis 97 nos vamos '
                       'a tener que cagar a trompadas o a besos disfrazos del joker',
            'created_at': '2026-09-08T19:35:24.991776-03:00',
            'game_id': 4,
            'id': 52,
            'is_deleted': False,
            'title': 'Elden Ring es un 100',
            'user_id': 3},
           {'category_id': None,
            'content': 'Despu├®s de 80 intentos logr├® vencer a Malenia con build de destreza pura usando Nagakiba y '
                       'Frostbite. El secreto del Waterfowl Dance es correr hacia atr├ís en la primera r├ífaga y rodar '
                       'hacia ella en las dos siguientes.',
            'created_at': '2026-09-08T19:26:13.455747-03:00',
            'game_id': 4,
            'id': 45,
            'is_deleted': False,
            'title': 'Gu├¡a para derrotar a Malenia sin invocar: builds y castigo de ataques',
            'user_id': 3},
           {'category_id': None,
            'content': 'Si',
            'created_at': '2026-09-08T20:11:07.003993-03:00',
            'game_id': 5,
            'id': 53,
            'is_deleted': False,
            'title': 'Aguante conter',
            'user_id': 5},
           {'category_id': None,
            'content': 'Desde la llegada de Clove muchos la prefieren por su autosuficiencia y poder humear despu├®s '
                       'de morir, pero la recarga infinita de humos de Omen y su paranoia siguen siendo irremplazables '
                       'en mapas como Ascent y Bind.',
            'created_at': '2026-09-08T19:26:13.463624-03:00',
            'game_id': 5,
            'id': 49,
            'is_deleted': False,
            'title': 'Clove vs Omen: ┬┐Qui├®n domina el meta de controladores en Valorant?',
            'user_id': 3},
           {'category_id': None,
            'content': 'Team Cherry sigue en silencio pero las clasificaciones por edades en Australia y Corea del Sur '
                       'sugieren que el desarrollo est├í en su etapa final. ┬┐Ser├í este el a├▒o del lanzamiento?',
            'created_at': '2026-09-08T19:26:13.465659-03:00',
            'game_id': 9,
            'id': 50,
            'is_deleted': False,
            'title': 'Hollow Knight Silksong: Las teor├¡as m├ís s├│lidas para este a├▒o',
            'user_id': 5},
           {'category_id': None,
            'content': 'Caca',
            'created_at': '2026-09-29T20:47:34.225893-03:00',
            'game_id': 19,
            'id': 54,
            'is_deleted': False,
            'title': 'El hueso',
            'user_id': 5},
           {'category_id': None,
            'content': 'Cada dia falta menos',
            'created_at': '2026-10-13T19:16:09.689118-03:00',
            'game_id': 1,
            'id': 55,
            'is_deleted': False,
            'title': 'Estreno GTA',
            'user_id': 5},
           {'category_id': 50,
            'content': 'Terrible loco con esquizofrenia el protagonista, encima poder ser terrible zurdito vende '
                       'patria corrupto, completamente canon',
            'created_at': '2026-10-13T19:50:16.417234-03:00',
            'game_id': 26,
            'id': 56,
            'is_deleted': False,
            'title': 'Que juego flashero',
            'user_id': 5}],
 'user_fav_games': [{'game_id': 24, 'user_id': 5}, {'game_id': 25, 'user_id': 5}, {'game_id': 23, 'user_id': 5}],
 'users': [{'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'root@foro.com',
            'id': 2,
            'is_active': True,
            'is_deleted': False,
            'is_staff': True,
            'is_superuser': True,
            'password': 'pbkdf2_sha256$1200000$H7saUaxRGOQHVE6vTG2ZnW$B18o4fCjo4/fxNhR4o99ZJ41E+qgZ04nX0uWGy5sSYQ=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'root'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'francisco@gmail.com',
            'id': 3,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$JuOQ6MMtQqGOCoZZLB5YuG$PAaLU6ejGvnzsTtNkoo78L2gdFMh9Xe0DQvbQcwW/hc=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'Francisco'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'testp@mail.com',
            'id': 4,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$iestVIQp2LFwv5pbqt6gk0$aknQAYNlNxhHK+20ll86BKHIokPxBqQfQCHYULrlvXc=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'testpostman'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'hikken@mail.com',
            'id': 7,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$UhicVHSyeCwWXxQmtM3EIn$snlqeJDr8PRBVPs0JSRNhwscMXu540JzUu41LFRdre4=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'hikken'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'testuser_tp4@mail.com',
            'id': 8,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$kHK1cCq9WVG4SBzryYZO0j$6bkxCbeSrIt0xcyU3vhbawpH1aqtfbZmiUD664yntiI=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'testuser_tp4'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'otheruser_tp4@mail.com',
            'id': 9,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$pZ7wfy8x1XBCw9nHHfoSdJ$/+zrzOpyslh+A6DwGfjCyI0RjjXv5iW6yGk2QStIlI4=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'otheruser_tp4'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'flow@mail.com',
            'id': 11,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$FVBrTZfxaa1stRDh8J32jx$UyKCVEINFentYRrQ4EnKpNyCYhtDBNeF5wB20fUVw9Q=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'flowuser'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'mod@mail.com',
            'id': 6,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$w971T3sxcRoARTZlNpbuzF$yRECGW1odkcOpythS7pbVjx7i6lxAI0VN71e+CaREe0=',
            'platforms': [],
            'role': 'MODERATOR',
            'steam_id': '',
            'username': 'mod'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'flowuser_d35f@mail.com',
            'id': 13,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$98CNyavD2jRO1AvqVEfwRC$rWOFkbNQDe/vop6+ORij4IVzNcAQRHCf5eUm4YSW3Sw=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'flowuser_d35f'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'flowuser_253a@mail.com',
            'id': 14,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$7QEGsJqPiPsydBfMhvxygH$oz3ko1JJkj8v+kJ4EeTA5jhkynRGi94qmXSKb5a9pk0=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'flowuser_253a'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'flowuser_1707@mail.com',
            'id': 15,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$waZEZJyQz9vQ1yIS1QiU6a$N2qA1JY7wLIX5T2MGfoQ1r//vWBnpUVyTtHYxeiCEmk=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'flowuser_1707'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'otrotest_10@mail.com',
            'id': 10,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$FBbajVzVUlxw1fx0SEMind$2DKLsGG+55zTVCUhVoC6nStunFyKaCQP/r6hFpsgp/M=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'otrotest'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'otromas_12@mail.com',
            'id': 12,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$vGFDkn0MHLlZBqcv0wUBMv$LeywNA6JZeErx34/eM90uv5B8cAPpZZ52SjBPUhUeCM=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'otromas'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'dupemail_7d6811_16@mail.com',
            'id': 16,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$yfzYrSXlMM4xy40Ar0FxjM$9nUUMJwNU/R/clzesPODNEtXb779X81Pq5GbAbe8Z0g=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'dupemail_7d6811'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#6366f1',
            'banner_url': '',
            'bio': '',
            'discord_tag': '',
            'email': 'flowuser_f6a0@mail.com',
            'id': 21,
            'is_active': True,
            'is_deleted': False,
            'is_staff': False,
            'is_superuser': False,
            'password': 'pbkdf2_sha256$1200000$HDuc1BavhtzwUZSrHjpmqe$iYB0nntQKSQ6loIPQz700i48RLXOv2vkicsqIwQz1W0=',
            'platforms': [],
            'role': 'USER',
            'steam_id': '',
            'username': 'flowuser_f6a0'},
           {'avatar': '\xadƒæ¥',
            'banner_color': '#0f172a',
            'banner_url': '',
            'bio': 'Soy el admin',
            'discord_tag': '',
            'email': 'admin@mail.com',
            'id': 5,
            'is_active': True,
            'is_deleted': False,
            'is_staff': True,
            'is_superuser': True,
            'password': 'pbkdf2_sha256$1200000$ZM1gbunAiAmq6E2jwnNilp$fi4VQabTZtKg/ZHKwEwxotRWvmboZzW5qCm/CvtEus0=',
            'platforms': ['PC', 'Xbox'],
            'role': 'ADMIN',
            'steam_id': '',
            'username': 'admin'}]}

def import_local_data(apps, schema_editor):
    User = apps.get_model('foro_juegos', 'User')
    Category = apps.get_model('foro_juegos', 'Category')
    Game = apps.get_model('foro_juegos', 'Game')
    Post = apps.get_model('foro_juegos', 'Post')

    user_map = {}
    for u in DATA['users']:
        obj = User.objects.filter(username=u['username']).first()
        if not obj:
            obj = User.objects.filter(email=u['email']).first()
        if obj:
            obj.password = u['password']
            obj.role = u['role']
            obj.bio = u['bio'] or ''
            obj.avatar = u['avatar'] or '👾'
            obj.banner_color = u['banner_color'] or '#6366f1'
            obj.banner_url = u['banner_url'] or ''
            obj.platforms = u['platforms'] or []
            obj.steam_id = u['steam_id'] or ''
            obj.discord_tag = u['discord_tag'] or ''
            obj.is_staff = bool(u['is_staff'])
            obj.is_superuser = bool(u['is_superuser'])
            obj.is_active = bool(u['is_active'])
            obj.is_deleted = bool(u['is_deleted'])
            obj.save()
        else:
            obj = User.objects.create(
                username=u['username'],
                email=u['email'],
                password=u['password'],
                role=u['role'],
                bio=u['bio'] or '',
                avatar=u['avatar'] or '👾',
                banner_color=u['banner_color'] or '#6366f1',
                banner_url=u['banner_url'] or '',
                platforms=u['platforms'] or [],
                steam_id=u['steam_id'] or '',
                discord_tag=u['discord_tag'] or '',
                is_staff=bool(u['is_staff']),
                is_superuser=bool(u['is_superuser']),
                is_active=bool(u['is_active']),
                is_deleted=bool(u['is_deleted']),
            )
        user_map[u['id']] = obj

    cat_map = {}
    for c in DATA['categories']:
        obj = Category.objects.filter(name=c['name']).first()
        if not obj and c['slug']:
            obj = Category.objects.filter(slug=c['slug']).first()
        if obj:
            obj.description = c['description']
            obj.image_url = c['image_url']
            obj.save()
        else:
            obj = Category.objects.create(
                name=c['name'],
                slug=c['slug'],
                description=c['description'],
                image_url=c['image_url']
            )
        cat_map[c['id']] = obj

    game_map = {}
    for g in DATA['games']:
        obj = Game.objects.filter(name=g['name']).first()
        if not obj and g['slug']:
            obj = Game.objects.filter(slug=g['slug']).first()
        if obj:
            obj.description = g['description']
            obj.image_url = g['image_url']
            obj.save()
        else:
            obj = Game.objects.create(
                name=g['name'],
                slug=g['slug'],
                description=g['description'],
                image_url=g['image_url']
            )
        game_map[g['id']] = obj

    for gg in DATA['game_genres']:
        g_obj = game_map.get(gg['game_id'])
        c_obj = cat_map.get(gg['category_id'])
        if g_obj and c_obj:
            g_obj.genres.add(c_obj)

    for ufg in DATA['user_fav_games']:
        u_obj = user_map.get(ufg['user_id'])
        g_obj = game_map.get(ufg['game_id'])
        if u_obj and g_obj:
            u_obj.favorite_games.add(g_obj)

    for p in DATA['posts']:
        u_obj = user_map.get(p['user_id'])
        if not u_obj:
            continue
        c_obj = cat_map.get(p['category_id']) if p['category_id'] else None
        g_obj = game_map.get(p['game_id']) if p['game_id'] else None
        Post.objects.update_or_create(
            title=p['title'],
            user=u_obj,
            defaults={
                'content': p['content'],
                'category': c_obj,
                'game': g_obj,
                'is_deleted': bool(p['is_deleted']),
            }
        )

class Migration(migrations.Migration):
    dependencies = [
        ('foro_juegos', '0014_seed_initial_forum_data'),
    ]
    operations = [
        migrations.RunPython(import_local_data, migrations.RunPython.noop),
    ]
