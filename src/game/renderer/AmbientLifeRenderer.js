/**
 * Draws map-specific wildlife as background scenery only.
 * These canvas details are not registered with the collision system.
 */
export class AmbientLifeRenderer {
  constructor() {
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  render(ctx, map, width, groundY) {
    ctx.save();
    switch (map.id) {
      case 'skyland':
        this.renderSkylandBirds(ctx, width);
        break;
      case 'jungle':
        this.renderJungleLife(ctx, width, groundY);
        break;
      case 'snowfall':
        this.renderSnowLife(ctx, width, groundY);
        break;
      case 'sunset-valley':
        this.renderSunsetBirds(ctx, width);
        break;
      case 'night-city':
        this.renderCityDrone(ctx, width);
        break;
      case 'desert':
        this.renderDesertLife(ctx, width, groundY);
        break;
      case 'ocean':
        this.renderOceanLife(ctx, width);
        break;
      case 'volcano':
        this.renderVolcanoBats(ctx, width);
        break;
      default:
        break;
    }
    ctx.restore();
  }

  renderSkylandBirds(ctx, width) {
    for (let index = 0; index < 4; index += 1) {
      const x = this.wrap(this.time * 24 + index * 112, width);
      const y = 116 + index * 34 + Math.sin(this.time * 2 + index) * 7;
      this.drawBird(ctx, x, y, 0.62 + (index % 2) * 0.12, this.time * 8 + index, '#35586a');
    }
  }

  renderSunsetBirds(ctx, width) {
    for (let index = 0; index < 3; index += 1) {
      const x = width - this.wrap(this.time * 15 + index * 130, width);
      const y = 206 + index * 20 + Math.sin(this.time * 1.6 + index) * 5;
      this.drawBird(ctx, x, y, 0.72, this.time * 7 + index, '#633c55');
    }
  }

  renderJungleLife(ctx, width, groundY) {
    for (let index = 0; index < 2; index += 1) {
      const x = this.wrap(this.time * 19 + index * 188, width);
      const y = 185 + index * 52 + Math.sin(this.time * 2.4 + index) * 9;
      this.drawParrot(ctx, x, y, 0.72, this.time * 7 + index);
    }

    this.drawMonkey(ctx, width * 0.72, groundY - 3);
  }

  renderSnowLife(ctx, width, groundY) {
    const penguins = [
      { x: width * 0.2, scale: 0.56 },
      { x: width * 0.26, scale: 0.42 },
      { x: width * 0.78, scale: 0.62 },
    ];
    penguins.forEach((penguin, index) => {
      const bob = Math.sin(this.time * 2 + index) * 1.5;
      this.drawPenguin(ctx, penguin.x, groundY - 5 + bob, penguin.scale);
    });

    const owlX = this.wrap(width - this.time * 12, width);
    this.drawBird(ctx, owlX, 155 + Math.sin(this.time * 1.4) * 8, 0.8, this.time * 5, '#465c70');
  }

  renderCityDrone(ctx, width) {
    const x = this.wrap(width - this.time * 20, width);
    const y = 178 + Math.sin(this.time * 1.8) * 8;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#303d5c';
    ctx.fillRect(-10, -3, 20, 6);
    ctx.fillRect(-3, -7, 6, 14);
    ctx.strokeStyle = '#96e9f2';
    ctx.lineWidth = 1.5;
    [-13, 13].forEach((dx) => {
      ctx.beginPath();
      ctx.moveTo(dx - 3, -5);
      ctx.lineTo(dx + 3, -5);
      ctx.moveTo(dx, -8);
      ctx.lineTo(dx, -2);
      ctx.stroke();
    });
    ctx.fillStyle = '#ff5fa2';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderDesertLife(ctx, width, groundY) {
    this.drawCamel(ctx, width * 0.73, groundY - 3, 0.72);
    const birdX = this.wrap(width - this.time * 18, width);
    this.drawBird(ctx, birdX, 210 + Math.sin(this.time * 1.7) * 6, 0.64, this.time * 6, '#76503a');
  }

  renderOceanLife(ctx, width) {
    for (let school = 0; school < 2; school += 1) {
      const x = this.wrap(this.time * (school ? 16 : 12) + school * 185, width);
      const y = 290 + school * 125 + Math.sin(this.time * 1.8 + school) * 10;
      for (let fish = 0; fish < 3; fish += 1) {
        this.drawFish(ctx, x - fish * 18, y + Math.sin(this.time * 2 + fish) * 5, 0.62 - fish * 0.08, school === 0 ? '#f5a66b' : '#f5d477');
      }
    }
  }

  renderVolcanoBats(ctx, width) {
    for (let index = 0; index < 4; index += 1) {
      const x = width - this.wrap(this.time * 22 + index * 98, width);
      const y = 170 + index * 29 + Math.sin(this.time * 2.2 + index) * 8;
      this.drawBat(ctx, x, y, 0.72, this.time * 10 + index);
    }
  }

  drawBird(ctx, x, y, scale, phase, color) {
    const flap = Math.sin(phase) * 4;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.quadraticCurveTo(-9, -10 - flap, -17, -8 - flap);
    ctx.quadraticCurveTo(-12, -1, -3, 2);
    ctx.quadraticCurveTo(5, -8 + flap, 15, -7 + flap);
    ctx.quadraticCurveTo(10, 0, 3, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(13, 2);
    ctx.lineTo(7, 3);
    ctx.fill();
    ctx.restore();
  }

  drawParrot(ctx, x, y, scale, phase) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(phase) * 0.05);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#17834d';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.ellipse(2, 2, 5, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc4d3d';
    ctx.beginPath();
    ctx.arc(3, -12, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4a340';
    ctx.beginPath();
    ctx.moveTo(9, -12);
    ctx.lineTo(16, -9);
    ctx.lineTo(9, -7);
    ctx.fill();
    ctx.fillStyle = '#216b47';
    ctx.beginPath();
    ctx.moveTo(-3, 11);
    ctx.lineTo(-8, 25);
    ctx.lineTo(-1, 15);
    ctx.lineTo(2, 26);
    ctx.lineTo(3, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(5, -14, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#18251d';
    ctx.beginPath();
    ctx.arc(5.5, -14, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawMonkey(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#4b3027';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(-24, -23, -12, -35);
    ctx.quadraticCurveTo(3, -42, 4, -26);
    ctx.stroke();
    ctx.fillStyle = '#654334';
    ctx.beginPath();
    ctx.ellipse(0, -18, 10, 16, 0.15, 0, Math.PI * 2);
    ctx.arc(0, -37, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d7a278';
    ctx.beginPath();
    ctx.ellipse(2, -35, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4b3027';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-4, -23);
    ctx.lineTo(-13, -11);
    ctx.moveTo(5, -22);
    ctx.lineTo(12, -12);
    ctx.moveTo(-4, -7);
    ctx.lineTo(-9, 0);
    ctx.moveTo(5, -7);
    ctx.lineTo(10, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawPenguin(ctx, x, feetY, scale) {
    ctx.save();
    ctx.translate(x, feetY);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#263d50';
    ctx.beginPath();
    ctx.ellipse(0, -18, 11, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5fbff';
    ctx.beginPath();
    ctx.ellipse(0, -15, 7, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#263d50';
    ctx.beginPath();
    ctx.arc(0, -38, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4a34a';
    ctx.beginPath();
    ctx.moveTo(7, -38);
    ctx.lineTo(14, -35);
    ctx.lineTo(7, -33);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(3, -40, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4a34a';
    ctx.fillRect(-8, -2, 7, 3);
    ctx.fillRect(2, -2, 7, 3);
    ctx.restore();
  }

  drawCamel(ctx, x, feetY, scale) {
    ctx.save();
    ctx.translate(x, feetY);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#81513a';
    ctx.beginPath();
    ctx.ellipse(0, -25, 30, 13, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(30, -23);
    ctx.quadraticCurveTo(20, -10, -22, -15);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(17, -29);
    ctx.lineTo(25, -51);
    ctx.lineTo(31, -49);
    ctx.lineTo(28, -28);
    ctx.lineTo(35, -24);
    ctx.lineTo(28, -21);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-5, -37, 10, 12, 0, Math.PI, Math.PI * 2);
    ctx.ellipse(12, -37, 9, 10, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#68402f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-18, -17);
    ctx.lineTo(-20, 0);
    ctx.moveTo(-3, -16);
    ctx.lineTo(-2, 0);
    ctx.moveTo(13, -17);
    ctx.lineTo(15, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawFish(ctx, x, y, scale, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2);
    ctx.moveTo(-10, 0);
    ctx.lineTo(-19, -7);
    ctx.lineTo(-19, 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#163f54';
    ctx.beginPath();
    ctx.arc(7, -1, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawBat(ctx, x, y, scale, phase) {
    const flap = Math.sin(phase) * 5;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#302637';
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.quadraticCurveTo(-5, -4, -8, -10 - flap);
    ctx.lineTo(-11, -3);
    ctx.lineTo(-18, -8 - flap);
    ctx.quadraticCurveTo(-17, 3, -7, 5);
    ctx.lineTo(-3, 2);
    ctx.quadraticCurveTo(3, -4, 8, 5);
    ctx.quadraticCurveTo(18, 3, 18, -8 - flap);
    ctx.lineTo(10, -3);
    ctx.lineTo(8, -10 - flap);
    ctx.quadraticCurveTo(5, -4, 0, 1);
    ctx.fill();
    ctx.restore();
  }

  wrap(value, width) {
    return ((value % width) + width) % width;
  }
}
