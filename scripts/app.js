let config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
          default: 'arcade',
          arcade: {
              gravity: { y: 300 },
              debug: false
          }
      },
      scene: {
          preload: preload,
          create: create,
          update: update
      }
  };
  
  //initiator
  let player, stars, bombs, platforms, cursors, scoreText, shiftKey, enterKey, timeText, enterText;
  let score = 0;
  let gameOver = false;
  let time = 0;
  let cStars = 0;
  let scaleChange = 0;
  let game = new Phaser.Game(config);
  
  //preloaded presets
  function preload ()
  {
      this.load.image('background', '../assets/images/bg.png');
      this.load.image('ground', '../assets/images/platforms.png');
      this.load.image('base', '../assets/images/mainplatform.png');
      this.load.image('star', '../assets/images/star.png');
      this.load.image('bomb', '../assets/images/bomb.png');
      this.load.spritesheet('player', '../assets/images/dude.png', { frameWidth: 32, frameHeight: 48 });
      this.load.audio('ambiance','../assets/music/bgm.mp3');
      this.load.audio('getItem','../assets/sounds/itemFound.mp3');
      this.load.audio('gameoverBGM','../assets/music/gameovermusic.mp3');

  }
  
  //importing asstes to the game
  function create ()
  {
      
    // Audio  
      getItemSfx = this.sound.add('getItem');
      bgm = this.sound.add('ambiance');
      gameoverMusic = this.sound.add('gameoverBGM');
      
      bgm.play();

    // Background
      this.add.image(400, 300, 'background');
  
      platforms = this.physics.add.staticGroup();
  
      //Base Platform
      platforms.create(400, 568, 'base').setScale(1).refreshBody();
  
      //  Three ledges
      platforms.create(600, 400, 'ground');
      platforms.create(50, 250, 'ground');
      platforms.create(750, 220, 'ground');
  
      // Player's sprite
      player = this.physics.add.sprite(100, 450, 'player');
  
      // Player's Properties
      player.setBounce(0.2);
      player.setCollideWorldBounds(true);
  
      // Character's movements
      this.anims.create({
          key: 'left',
          frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1
      });
  
      this.anims.create({
          key: 'turn',
          frames: [ { key: 'player', frame: 4 } ],
          frameRate: 20
      });
  
      this.anims.create({
          key: 'right',
          frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
          frameRate: 10,
          repeat: -1
      });
  
      //  Controls/Inputs
      cursors = this.input.keyboard.createCursorKeys();
      enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  
      //  12 stars across the map
      stars = this.physics.add.group({
          key: 'star',
          repeat: 11,
          setXY: { x: 12, y: 0, stepX: 70 }
      });
  
      stars.children.iterate(function (child) {
  
          //  Give each star a slightly different bounce
          child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  
      });
  
      bombs = this.physics.add.group();
  
      //  Scoring and Time System (provided thickness due to vibrant background)
      scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: 32, fill: '#000', stroke: '#fff', strokeThickness: 2 });
      timeText = this.add.text(16, 50, 'Time: 0', { fontSize : 32, fill: '#000', stroke: '#fff', strokeThickness: 2 });

      //  Appplying colliders towards platforms
      this.physics.add.collider(player, platforms);
      this.physics.add.collider(stars, platforms);
      this.physics.add.collider(bombs, platforms);
  
      //  Player will overlap stars, but not bombs
      this.physics.add.overlap(player, stars, collectStar, null, this);
      this.physics.add.collider(player, bombs, hitBomb, null, this);

      //Time event
      timedEvent = this.time.addEvent({ delay:1000 ,callback: onEvent, callbackScope: this, loop: true});
  }
  
  function onEvent (){
    time += 5; //add 5 every 1000 delay
}

function update ()
{
    timeText.setText('Time: ' + time);

    if (gameOver == true) 
    {   //Gameover scene (provided thickness due to vibrant background))
        timedEvent.remove();
        gameoverText = this.add.text(245,250, ' GAME OVER ', {fontSize: 50, fill: '#FF0000', stroke: '#fff', strokeThickness: 2});
        enterText = this.add.text(245,300, ' hit ENTER to restart ', {fontSize: 25, fill: '#000000', stroke: '#fff', strokeThickness: 2});
        //Restart option
        if (enterKey.isDown)
        {

        this.scene.restart(); // restart current scene
        time = 0
        gameOver = false;

        }
    }

    // Sprint Option
    if (shiftKey.isDown){
        if (cursors.left.isDown)
        {
        player.setVelocityX(-300);

        player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {   
        player.setVelocityX(300);

        player.anims.play('right', true);
        }
        else
        {
        player.setVelocityX(0);

        player.anims.play('turn');
        }
    }
    //Movements
    else if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }

    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
    
}
  //Collecting stars changes the appearance of player with sfx
  function collectStar (player, star)
  {
      getItemSfx.play();
      star.disableBody(true, true);
      //  Add and update the score
      score += 10;
      scoreText.setText('Score: ' + score);
  
      //recolor sprite body on star collection
      cStars += 1;
      if (cStars == 1){
          player.setTint(0xff0000);
      }
      else if (cStars == 2){
          player.setTint(0xFFA500);
      }
      else if (cStars == 3) {
          player.setTint(0xffff00);
      }
      else if (cStars == 4) {
          player.setTint(0x00ff00);
      }
      else if (cStars == 5) {
          player.setTint(0x0000ff);
      }
      else if (cStars == 6) {
          player.setTint(0x4b0082);
      }
      else {
          player.setTint(0xee82ee);
          cStars = 0; //reset cStars to 0
      }
  
      //resize sprite body on star collection
      scaleChange += 1;
      if (scaleChange == 1){
          player.setScale(1.1);
      }
      else if (scaleChange == 2) {
          player.setScale(1.2);
      }
      else if (scaleChange == 3) {
          player.setScale(1.3);
      }
      else if (scaleChange == 4) {
          player.setScale(1.4);
      }
      else {
          player.setScale(1);
          scaleChange = 0; //reset scaleCount to 0
      }
  
      if (stars.countActive(true) === 0)
      {
          //  A new batch of stars to collect
          stars.children.iterate(function (child) {
  
              child.enableBody(true, child.x, 0, true, true);
  
          });
  
          let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
  
          let bomb = bombs.create(x, 16, 'bomb');
          bomb.setBounce(1);
          bomb.setCollideWorldBounds(true);
          bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
          bomb.allowGravity = false;
  
      }
      
  }
  //Gameover will stop the bgm and play the gameover music instead with grey tint to emphasize gameover.
  function hitBomb (player, bomb)
  {
      this.physics.pause();

      bgm.stop();

      gameoverMusic.play();

      player.setTint(0x191919);
  
      player.anims.play('turn');
  
      gameOver = true;
  }