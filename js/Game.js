var PlatfomerGame = PlatformerGame || {};

//title screen
PlatformerGame.Game = function(){};

PlatformerGame.Game.prototype = {
    create: function() {

        //  A simple background for our game
        this.backgroundSprite = this.game.add.sprite(0, 0, 'tiles');
        this.backgroundSprite.frame = 1;
        this.backgroundSprite.scale.setTo(350,30);

        this.map = this.game.add.tilemap('level1');

        this.map.addTilesetImage('redtiles', 'tiles');

        //this.blockedLayer = this.map.createLayer('objectLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');
        //this.foregroundLayer = this.map.createLayer('foregroundLayer');

        this.map.setCollisionBetween(1, 10000, true, 'blockedLayer');

        // make the world boundaries fit the ones in the tiled map
        this.blockedLayer.resizeWorld();

        var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.player = this.game.add.sprite(result[0].x, result[0].y, 'dude');
        this.player.frame = 1; 

        //  We need to enable physics on the player
        this.game.physics.arcade.enable(this.player);
        //this.game.camera.setSize(this.game.world.width, this.game.world.height);

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.body.bounce.y = 0;
        this.player.body.gravity.y = 400;
        this.player.anchor.setTo(0.5);
        this.player.body.setSize(10,25,2,3);
        this.player.body.collideWorldBounds = false;

        this.game.camera.follow(this.player);

        //  Our two animations, walking left and right.
        this.player.animations.add('left', [0,1, 2, 3], 10, true);
        this.player.animations.add('right', [0,1, 2, 3], 10, true);

        //  Finally some stars to collect
        this.stars = this.game.add.group();

        //  We will enable physics for any star that is created in this group
        this.stars.enableBody = true;

        this.music = this.game.add.audio('music');
        this.music.loop = true;
     //   this.music.play();

        //  The score
        this.scoreText = this.game.add.text(200, this.game.height/2 - 25, '', { fontSize: '32px', fill: '#5a0c0c' });
        this.scoreText.fixedToCamera = true;
        this.score = 0;

        //  Our controls.
        this.cursors = this.game.input.keyboard.createCursorKeys();
        
        this.timer = 0;

        this.showDebug = false;
    },

    createStar: function(x) {

        var invert = false;
        y = -100;
        if (this.game.rnd.integerInRange(0,1) == 1) {
            invert = true;
            y = 500;
        }

        var star = this.stars.create(x + this.game.rnd.integerInRange(-100,100), y, 'tiles');
       //  Let gravity do its thing
        star.body.gravity.y = 300;
        star.frame = 0;
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
//        this.star.body.gravity.y = 300;
      //  star.dangerous = true;
        star.body.velocity.x = this.game.rnd.integerInRange(10, 300);
        if (this.game.rnd.integerInRange(0,1) == 1) {
            star.body.velocity.x *= -1;
        }
        star.body.velocity.y = this.game.rnd.integerInRange(10, 300);
        if (invert) {
            star.body.velocity.y *= -1;
        }


    },
    update: function() {
        this.timer++;

        if (this.timer % 20 == 0 ) {
            this.createStar(this.player.x);
        }
        //  Collide the player and the stars with the platforms
        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.collide(this.stars, this.blockedLayer);
        this.game.physics.arcade.collide(this.player, this.stars);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.game.physics.arcade.overlap(this.player, this.exit, this.collectStar, null, this);

        //  Reset the players velocity (movement)
        this.player.body.velocity.x = 0;

        if (this.cursors.left.isDown)
        {
            //  Move to the left
            this.player.scale.setTo(-1, 1);
            this.player.body.velocity.x = -150;

            this.player.animations.play('left');
        }
        else if (this.cursors.right.isDown)
        {
            //  Move to the right
            this.player.scale.setTo(1, 1);
            this.player.body.velocity.x = 150;

            this.player.animations.play('right');
        }
        else
        {
            //  Stand still
            this.player.animations.stop();

            this.player.frame = 3;
        }
        
        //  Allow the player to jump if they are touching the ground.
        if (this.cursors.up.isDown && (this.player.body.blocked.down ||  this.player.body.touching.down))
        {
            this.player.body.velocity.y = -180;
        }

        if (this.player.y > this.game.world.height) {
            this.death();
        }

    },

    death: function() {
        var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.player.x = result[0].x;
        this.player.y = result[0].y;
        this.player.frame = 1; 

    },

    collectStar : function(player, star) {
        
        // Removes the star from the screen
        star.kill();
        if (star.dangerous) {
            player.kill();
        }

        //  Add and update the score
        this.game.gamera.flash("5a0c0c");
        this.scoreText.text = 'You win!';

    },


    // find objects in a tiled layer that contains a property called "type" equal to a value
    findObjectsByType: function(type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function(element) {
            if (element.properties.type === type) {
                // phaser uses top left - tiled bottom left so need to adjust:
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },

    createFromTiledObject: function(element, group) {
        var sprite = group.create(element.x, element.y, 'objects');
        sprite.frame = parseInt(element.properties.frame);

        // copy all of the sprite's properties
        Object.keys(element.properties).forEach(function(key) {
            sprite[key] = element.properties[key];
        });
    },


    render: function() {

        if (this.showDebug) {
            this.game.debug.body(this.star);
            this.game.debug.body(this.player);
        }
    },

};
