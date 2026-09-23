class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.hasGuessed = false;
    }
}

class Game {
    constructor(settings) {
        this.rounds = settings.rounds; 
        this.drawTime = settings.drawTime;
        this.phase = "lobby"; 
        this.currentRound = 1; 
        this.drawerIndex = 0;
        this.currentWord = "";
        this.wordOptions = [];
        this.timerId = null;
        this.timeLeft = 0;
    }
}

class Room {
    constructor(id, hostPlayer, settings) {
        this.id = id;
        this.hostId = hostPlayer.id;
        this.players = [hostPlayer];
        this.settings = settings; 
        this.game = new Game(this.settings);
    }

    addPlayer(player) {
        if (this.players.length < this.settings.maxPlayers) {
            this.players.push(player);
            return true;
        }
        return false;
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
    }

    getDrawer() {
        return this.players[this.game.drawerIndex];
    }
}

module.exports = { Player, Game, Room };
