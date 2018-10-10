import {LogManager} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {IdentityService} from './services/identity-service';
import {ChaincodeService} from './services/chaincode-service';
import {ConfigService} from './services/config-service';


let log = LogManager.getLogger('Home');

$('#test').button('toggle');

@inject(IdentityService, EventAggregator, ChaincodeService, ConfigService)
export class Home {
  channelList = [];
  chaincodeList = [];
  orgList = [];
  orgs = [];
  installedChain = [];
  blocks = [];
  bList = [];
  targets = [];
  oneChannel = null;
  oneChaincode = null;
  oneOrg = null;
  fnc = null;
  args = null;
  invoke = null;
  query = null;
  selectedChain = null;
  inf = null;

  constructor(identityService, eventAggregator, chaincodeService, configService) {
    this.identityService = identityService;
    this.eventAggregator = eventAggregator;
    this.chaincodeService = chaincodeService;
    this.configService = configService;
  }

  attached() {
    this.queryChannels();
    this.subscriberBlock = this.eventAggregator.subscribe('block', o => {
      log.debug('block', o);
      this.queryAll();
    });
  }

  detached() {
    this.subscriberBlock.dispose();
  }

  queryAll() {
  }

  queryChannels() {
    this.chaincodeService.getChannels().then(channels => {
      this.channelList = channels;
    });
  }

  queryChaincodes() {
    this.chaincodeService.getChaincodes(this.oneChannel).then(chaincodes => {
      this.chaincodeList = chaincodes;
    });
    this.queryOrgs();
    this.queryAllChain();
    setTimeout(this.queryBlocks(), 1000);
  }

  queryOrgs() {
    this.chaincodeService.getOrgs(this.oneChannel).then(orgs => {
      this.orgList = orgs;
    });

  }

  queryTarg(){
    this.targets = JSON.parse(JSON.stringify(this.orgList));
    let pos = this.targets.indexOf("Orderer");
    this.targets.splice(pos, 1);
  }

  queryAllChain() {
    this.chaincodeService.getInstalledChaincodes().then(chain => {
      this.installedChain = chain;
    });
  }

  queryBlocks() {
    this.chaincodeService.getLastBlock(this.oneChannel).then(block => {
      console.log(block);
      for (let i = block - 5; i < block; i++) {
        if (i < 0)
          continue;
        this.chaincodeService.getBlock(this.oneChannel, i).then(block => {
          this.bList.push(block);
        });
      }
    });
    let bl = this.bList.sort();
    let ch = this.oneChannel;
    this.blocks.push({ch, bl});
    console.log(this.blocks);
  }

  // addChannelChaincode() {
  //   this.chaincodeService.installChaincode(this.oneChannel, this.selectedChain).then(inf => {
  //     this.inf = inf;
  //   });
  //   this.queryChaincodes();
  // }

  // addChannelChaincode() {
  //   this.chaincodeService.installChaincode(this.oneChannel, this.selectedChain).then(inf => {
  //     this.inf = inf;
  //   });
  //   this.queryChaincodes();
  // }
  //
  addChannelOrg() {
    this.chaincodeService.addOrg(this.oneChannel, this.oneOrg);
    this.queryOrgs();
  }

  getInvoke() {
    this.query = null;
    this.chaincodeService.invoke(this.oneChannel, this.oneChaincode, this.fnc, this.args).then(invoke => {
      this.invoke = invoke;
    });
    this.targets.splice(0, 1);
    //this.queryBlocks();

  }

  getQuery() {
    this.invoke = null;
    this.chaincodeService.query(this.oneChannel, this.oneChaincode, this.fnc, this.args).then(query => {
      this.query = query;
    });
  }


}
