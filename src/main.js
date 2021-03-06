const assert = require('./assert');
const Node = require('./Node');
const {getEnv} = require('./util');

module.exports = ({networkAbstraction}) => {
  let bootstrapNodes = getEnv().P2PWEB_BOOTSTRAP;
  bootstrapNodes = Array.isArray(bootstrapNodes)
    ? bootstrapNodes
    : [bootstrapNodes];
  console.log('hello from main', networkAbstraction, bootstrapNodes);
  assert(networkAbstraction);
  const node = new Node({bootstrapNodes, networkAbstraction});
  networkAbstraction.onconnection = con => {
    node.addConnection(con);
  };
  setInterval(() => {
    node.connections.map(o => o.addr).forEach(addr => {
      node.send(addr, {
        rpc: 'print',
        data: 'hello from ' + node.name()
      });
    });
  }, 3000);
};
