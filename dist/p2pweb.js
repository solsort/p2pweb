(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

const window = typeof self === 'undefined' ? {} : self;
module.exports = window;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const window = __webpack_require__(0);
const Node = __webpack_require__(3);
window.Node = Node;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// # Node
HashAddress = __webpack_require__(4);

let nodes = [];
/**
  */
this.exports = class Node {
  /**
    */
  constructor({ bootstrapNodes }) {
    nodes.push(this);

    this.bootstrapNodes = bootstrapNodes;
    this.connections = [];
    this.rpc = {};

    for (const method in rpc) {
      this.rpc[method] = rpc[method].bind(this);
    }

    (async () => {
      // TODO generate through DSA-key here later (bad random for the moment).
      this.myAddress = await HashAddress.generate(
        String(Math.random())
      );
      this.bootstrap();
    })();
  }

  /**
     * List of all known peers (one hop from current node)
     */
  allPeers() {
    let peers = Object.keys(
      pairsToObject(
        this.connections
          .map(o => o.addr)
          .concat.apply([], this.connections.map(o => o.peers))
          .map(s => [s, true])
      )
    ).filter(o => o !== this.address().toString());
    return peers;
  }

  /**
     * @private
    */
  bootstrap() {
    if (!this.bootstrapping && this.connections.length === 0) {
      this.bootstrapping = true;
      setTimeout(() => {
        this.bootstrapping = false;
        this.bootstrap();
      }, 1000);

      const o = { close: () => {} };
      platform.receiveSignalling(o);
      o.onmessage({
        data: {
          websocket:
            bootstrapNodes[(Math.random() * bootstrapNodes.length) | 0]
        }
      });
    }
  }

  /**
    */
  send(addr, msg) {
    const c = this.findConnection(addr);
    if (c) {
      c.con.send(msg);
    } else if (this.address().toString() === addr) {
      this.local(msg);
    } else if (this.allPeers().includes(addr)) {
      for (const peer of this.connections) {
        if (peer.peers.includes(addr)) {
          peer.con.send({ rpc: "relay", dst: addr, data: msg });
          break;
        }
      }
    } else {
      print("no connection to " + String(addr).slice(0, 4), msg);
      print(this.allPeers().map(s => s.slice(0, 4)));
      throw new Error();
    }
  }

  /**
    */
  local(msg) {
    if (this.rpc[msg.data.rpc]) {
      this.rpc[msg.data.rpc](msg);
    } else {
      print("no such endpoint " + JSON.stringify(msg.data));
    }
  }

  /**
    */
  findConnection(addr) {
    return this.connections.find(o => o.addr === addr);
  }

  /**
    */
  address() {
    return this.myAddress;
  }

  /**
    */
  name() {
    return this.address()
      .toString()
      .slice(0, 4);
  }

  /**
    */
  addConnection(con) {
    let name = "";

    const peer = { con };
    peer.con.onmessage = msg => this.local(msg);

    peer.con.onclose = () => {
      const addr = (this.connections.find(o => o.con === peer.con) ||
        {}).addr;
      this.connections = this.connections.filter(
        o => o.con !== peer.con
      );
      print("close", (con.addr || "????").slice(0, 4));

      if (addr) {
        for (const peer of this.connections.map(o => o.addr)) {
          this.send(peer, { rpc: "lostPeer", addr: addr });
        }
      }
    };

    peer.con.t2 = Date.now() + Math.random();
    peer.con.send({
      time: peer.con.t2,
      weigh: 1 + Math.random(),
      rpc: "connect",
      addr: this.address().toString(),
      peers: this.connections.map(o => o.addr),
      isNodeJs: isNodeJs
    });
    print("addconnection");
  }
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// # Hash Address

const window = __webpack_require__(0);
console.log(window.crypto);
/**
 * Hashes as addresses, and utility functions for Kademlia-like routing.
 */
module.exports = class HashAddress {
  constructor(o) {
    if (o instanceof Uint8Array && o.length === 32) {
      this.data = o;
    } else {
      throw new Error();
    }
  }

  /**
    */
  static async generate(src /*ArrayBuffer | String*/) {
    if (typeof src === "string") {
      src = ascii2buf(src);
    } else {
      assert(src instanceof ArrayBuffer);
    }
    let hash = await window.crypto.subtle.digest("SHA-256", src);
    return new HashAddress(new Uint8Array(hash));
  }

  /**
    */
  equals(addr) {
    for (let i = 0; i < 32; ++i) {
      if (this.data[i] !== addr.data[i]) {
        return false;
      }
    }
    return true;
  }

  /**
    */
  static async TEST_constructor_generate_equals() {
    let a = await HashAddress.generate("hello world");
    let b = await HashAddress.generate("hello world");
    let c = await HashAddress.generate("hello wørld");
    a.equals(b) || throwError("equals1");
    !a.equals(c) || throwError("equals2");
  }

  /**
    */
  static fromUint8Array(buf) {
    return new HashAddress(buf.slice());
  }

  /**
    */
  static fromArrayBuffer(buf) {
    return HashAddress.fromUint8Array(new Uint8Array(buf));
  }

  /**
    */
  static fromString(str) {
    return HashAddress.fromArrayBuffer(ascii2buf(atob(str)));
  }

  /**
    */
  static fromHex(str) {
    return HashAddress.fromArrayBuffer(hex2buf(str));
  }

  /**
    */
  toArrayBuffer() {
    return this.data.slice().buffer;
  }

  /**
    */
  toString() {
    return btoa(buf2ascii(this.toArrayBuffer()));
  }

  /**
    */
  toHex() {
    return buf2hex(this.toArrayBuffer());
  }

  static async TEST_from_toArrayBuffer_toString() {
    let a = await HashAddress.generate("hello");
    let b = HashAddress.fromArrayBuffer(a.toArrayBuffer());
    let c = HashAddress.fromString(a.toString());
    let x80 = HashAddress.fromString(
      "gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    );
    a.equals(b) || throwError();
    a.equals(c) || throwError();
    x80.toHex().startsWith("800") || throwError();
  }

  /**
   * xor-distance between two addresses, - with 24 significant bits, 
   * and with an offset such that the distance between `0x000..` 
   * and `0x800...` is `2 ** 123`, and distance `0b1111..` and 
   * `0b1010111..` is `2**122 + 2**120`. 
   * This also means that the distance can be represented 
   * within a single precision float. (with some loss on least significant bits)
   */
  dist(addr) {
    let a = new Uint8Array(this.data);
    let b = new Uint8Array(addr.data);
    for (let i = 0; i < 32; ++i) {
      if (a[i] !== b[i]) {
        return (
          2 ** (93 - i * 8) *
          (((a[i] ^ b[i]) << 23) |
            ((a[i + 1] ^ b[i + 1]) << 15) |
            ((a[i + 2] ^ b[i + 2]) << 7) |
            ((a[i + 3] ^ b[i + 3]) >> 1))
        );
      }
    }
    return 0;
  }

  /**
   * index of first bit in addr that is different. 
   */
  distBit(addr) {
    return HashAddress.distBit(this.dist(addr));
  }

  /*
   * addr1.logDist(addr2) === HashAddress.logDist(addr1.dist(addr2))
   */
  static distBit(dist) {
    return 123 - Math.floor(Math.log2(dist));
  }

  static TEST_dist() {
    let h;
    let zero = HashAddress.fromHex(
      "0000000000000000000000000000000000000000000000000000000000000000"
    );

    h = HashAddress.fromHex(
      "0000000000000000000000000000001000000000000000000000000000000000"
    );
    zero.dist(h) === 1 || throwError();

    h = HashAddress.fromHex(
      "8000000000000000000000000000000000000000000000000000000000000000"
    );
    zero.dist(h) === 2 ** 123 || throwError();
    zero.distBit(h) === 0 || throwError();

    h = HashAddress.fromHex(
      "0000000000000000000000000000000000000000000000000000000000000001"
    );
    zero.dist(h) === 2 ** -132 || throwError();
    zero.distBit(h) === 255 || throwError();

    h = HashAddress.fromHex(
      "0f00000000000000000000000000000000000000000000000000000000000000"
    );
    zero.distBit(h) === 4 || throwError();
  }

  /**
   * Flip the bit at pos, and randomise every bit after that
   */
  flipBitRandomise(pos) {
    let src = new Uint8Array(this.data);
    let dst = src.slice();
    let bytepos = pos >> 3;
    window.crypto.getRandomValues(dst.subarray(bytepos));

    let mask = 0xff80 >> (pos & 7);
    let inverse = 0x80 >> (pos & 7);
    dst[pos >> 3] =
      (src[bytepos] & mask) | ((dst[bytepos] & ~mask) ^ inverse);

    return new HashAddress(dst);
  }

  static TEST_flipBitRandomise() {
    let zero = HashAddress.fromHex(
      "0000000000000000000000000000000000000000000000000000000000000000"
    );

    zero
      .flipBitRandomise(3)
      .toHex()
      .startsWith("1") || throwError();
    zero
      .flipBitRandomise(7)
      .toHex()
      .startsWith("01") || throwError();
    zero
      .flipBitRandomise(7 + 8)
      .toHex()
      .startsWith("0001") || throwError();
  }
}


/***/ })
/******/ ]);
});
//# sourceMappingURL=p2pweb.js.map