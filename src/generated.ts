import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ActorRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const actorRegistryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'function',
    inputs: [],
    name: 'AWARD_BODY_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BEEKEEPER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BOTTLER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CERTIFICATION_BODY_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LAB_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LOGISTICS_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RETAILER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'actors',
    outputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'registered', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'certifications',
    outputs: [
      { name: 'ipfsCid', internalType: 'string', type: 'string' },
      { name: 'organicScore', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'actorAddress', internalType: 'address', type: 'address' },
    ],
    name: 'getActor',
    outputs: [
      {
        name: '',
        internalType: 'struct ActorRegistry.Actor',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'registered', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllActors',
    outputs: [
      { name: 'addresses', internalType: 'address[]', type: 'address[]' },
      {
        name: 'actorList',
        internalType: 'struct ActorRegistry.Actor[]',
        type: 'tuple[]',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'registered', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'actorAddress', internalType: 'address', type: 'address' },
      { name: 'name', internalType: 'string', type: 'string' },
    ],
    name: 'registerActor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'actorAddress', internalType: 'address', type: 'address' },
      { name: 'ipfsCid', internalType: 'string', type: 'string' },
      { name: 'organicScore', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'setCertification',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HoneyToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const honeyTokenAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'uri_', internalType: 'string', type: 'string' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC1155InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidApprover',
  },
  {
    type: 'error',
    inputs: [
      { name: 'idsLength', internalType: 'uint256', type: 'uint256' },
      { name: 'valuesLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC1155InvalidArrayLength',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidSender',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1155MissingApprovalForAll',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'ids',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'values',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'TransferBatch',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransferSingle',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'value', internalType: 'string', type: 'string', indexed: false },
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'URI',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accounts', internalType: 'address[]', type: 'address[]' },
      { name: 'ids', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'balanceOfBatch',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'batchQuantities',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTokenData',
    outputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'isJar', internalType: 'bool', type: 'bool' },
      { name: 'jarSizeGrams', internalType: 'uint32', type: 'uint32' },
      { name: 'originalQuantity', internalType: 'uint256', type: 'uint256' },
      { name: 'processed', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'grams', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'jarTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    name: 'markBatchProcessed',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'quantity', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'mintBulkBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'bulkHolder', internalType: 'address', type: 'address' },
      { name: 'jarSizesGrams', internalType: 'uint32[]', type: 'uint32[]' },
      { name: 'jarCounts', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'jarRecipient', internalType: 'address', type: 'address' },
    ],
    name: 'mintJars',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'processedBatches',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'ids', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeBatchTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'supplyChainAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setSupplyChain',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'supplyChain',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'uri',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PricingModel
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pricingModelAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'actorRegistryAddress',
        internalType: 'address',
        type: 'address',
      },
      { name: 'qualityIndexAddress', internalType: 'address', type: 'address' },
      { name: 'initialAlpha', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'actorRegistry',
    outputs: [
      { name: '', internalType: 'contract ActorRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'alpha',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'jarSizeGrams', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'calculatePrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    name: 'floorPrices',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'jarSizeGrams', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'getPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'qualityIndex',
    outputs: [
      { name: '', internalType: 'contract QualityIndex', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newAlpha', internalType: 'uint256', type: 'uint256' }],
    name: 'setAlpha',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'jarSizeGrams', internalType: 'uint32', type: 'uint32' },
      { name: 'priceCents', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setFloorPrice',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ProductGateway
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const productGatewayAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'actorRegistryAddress',
        internalType: 'address',
        type: 'address',
      },
      { name: 'supplyChainAddress', internalType: 'address', type: 'address' },
      { name: 'honeyTokenAddress', internalType: 'address', type: 'address' },
      { name: 'qualityIndexAddress', internalType: 'address', type: 'address' },
      { name: 'pricingModelAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'actorRegistry',
    outputs: [
      { name: '', internalType: 'contract ActorRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    name: 'getBatchData',
    outputs: [
      {
        name: 'batch',
        internalType: 'struct SupplyChain.Batch',
        type: 'tuple',
        components: [
          { name: 'quantity', internalType: 'uint256', type: 'uint256' },
          { name: 'harvestYear', internalType: 'uint16', type: 'uint16' },
          { name: 'beekeeper', internalType: 'address', type: 'address' },
        ],
      },
      { name: 'holder', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'jarSizeGrams', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'getPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    name: 'getQualityData',
    outputs: [
      { name: 'si', internalType: 'uint256', type: 'uint256' },
      { name: 'phqi', internalType: 'uint256', type: 'uint256' },
      { name: 'mci', internalType: 'uint256', type: 'uint256' },
      { name: 'qi', internalType: 'uint256', type: 'uint256' },
      {
        name: 'state',
        internalType: 'enum QualityIndex.BatchState',
        type: 'uint8',
      },
      {
        name: 'reason',
        internalType: 'enum QualityIndex.GatekeeperReason',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTokenData',
    outputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'isJar', internalType: 'bool', type: 'bool' },
      { name: 'jarSizeGrams', internalType: 'uint32', type: 'uint32' },
      { name: 'originalQuantity', internalType: 'uint256', type: 'uint256' },
      { name: 'processed', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'honeyToken',
    outputs: [
      { name: '', internalType: 'contract HoneyToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pricingModel',
    outputs: [
      { name: '', internalType: 'contract PricingModel', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'qualityIndex',
    outputs: [
      { name: '', internalType: 'contract QualityIndex', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'honeyTokenAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setHoneyToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pricingModelAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setPricingModel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'qualityIndexAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setQualityIndex',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'supplyChainAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setSupplyChain',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'supplyChain',
    outputs: [
      { name: '', internalType: 'contract SupplyChain', type: 'address' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QualityIndex
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const qualityIndexAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'actorRegistryAddress',
        internalType: 'address',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'batchId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'ipfsCid',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'PHQIDataSubmitted',
  },
  {
    type: 'function',
    inputs: [],
    name: 'actorRegistry',
    outputs: [
      { name: '', internalType: 'contract ActorRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'awardCertificateCid',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'batchStates',
    outputs: [
      { name: '', internalType: 'enum QualityIndex.BatchState', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    name: 'calculateMCI',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'input',
        internalType: 'struct QualityIndex.PHQIInput',
        type: 'tuple',
        components: [
          {
            name: 'normalizedWaterContent',
            internalType: 'uint16',
            type: 'uint16',
          },
          { name: 'hmf', internalType: 'uint16', type: 'uint16' },
          { name: 'invertaseActivity', internalType: 'uint16', type: 'uint16' },
          {
            name: 'waterContentPercent',
            internalType: 'uint16',
            type: 'uint16',
          },
        ],
      },
    ],
    name: 'calculatePHQI',
    outputs: [
      { name: 'phqi', internalType: 'uint256', type: 'uint256' },
      {
        name: 'reason',
        internalType: 'enum QualityIndex.GatekeeperReason',
        type: 'uint8',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    name: 'calculateQI',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'input',
        internalType: 'struct QualityIndex.SIInput',
        type: 'tuple',
        components: [
          { name: 'forage', internalType: 'uint16', type: 'uint16' },
          { name: 'lightIntensity', internalType: 'uint16', type: 'uint16' },
          { name: 'waterSource', internalType: 'uint16', type: 'uint16' },
          { name: 'summerTemperature', internalType: 'uint16', type: 'uint16' },
          { name: 'winterTemperature', internalType: 'uint16', type: 'uint16' },
          { name: 'windSpeed', internalType: 'uint16', type: 'uint16' },
          { name: 'humidity', internalType: 'uint16', type: 'uint16' },
          { name: 'precipitation', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    name: 'calculateSI',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    name: 'checkGatekeeper',
    outputs: [
      { name: 'sellable', internalType: 'bool', type: 'bool' },
      {
        name: 'reason',
        internalType: 'enum QualityIndex.GatekeeperReason',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'gatekeeperFlags',
    outputs: [
      {
        name: '',
        internalType: 'enum QualityIndex.GatekeeperReason',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    name: 'getQualityData',
    outputs: [
      { name: 'si', internalType: 'uint256', type: 'uint256' },
      { name: 'phqi', internalType: 'uint256', type: 'uint256' },
      { name: 'mci', internalType: 'uint256', type: 'uint256' },
      { name: 'qi', internalType: 'uint256', type: 'uint256' },
      {
        name: 'state',
        internalType: 'enum QualityIndex.BatchState',
        type: 'uint8',
      },
      {
        name: 'reason',
        internalType: 'enum QualityIndex.GatekeeperReason',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'mciData',
    outputs: [
      { name: 'variety', internalType: 'uint16', type: 'uint16' },
      { name: 'region', internalType: 'uint16', type: 'uint16' },
      { name: 'organic', internalType: 'uint16', type: 'uint16' },
      { name: 'award', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'originCid',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'phqiReportCid',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'qualityData',
    outputs: [
      { name: 'si', internalType: 'uint256', type: 'uint256' },
      { name: 'phqi', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'supplyChainAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setSupplyChain',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'level', internalType: 'uint16', type: 'uint16' },
      { name: 'ipfsCid', internalType: 'string', type: 'string' },
    ],
    name: 'submitAward',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'region', internalType: 'uint16', type: 'uint16' },
      { name: 'ipfsCid', internalType: 'string', type: 'string' },
    ],
    name: 'submitOrigin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'input',
        internalType: 'struct QualityIndex.PHQIInput',
        type: 'tuple',
        components: [
          {
            name: 'normalizedWaterContent',
            internalType: 'uint16',
            type: 'uint16',
          },
          { name: 'hmf', internalType: 'uint16', type: 'uint16' },
          { name: 'invertaseActivity', internalType: 'uint16', type: 'uint16' },
          {
            name: 'waterContentPercent',
            internalType: 'uint16',
            type: 'uint16',
          },
        ],
      },
      { name: 'variety', internalType: 'uint16', type: 'uint16' },
      { name: 'ipfsCid', internalType: 'string', type: 'string' },
    ],
    name: 'submitPHQIData',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'input',
        internalType: 'struct QualityIndex.SIInput',
        type: 'tuple',
        components: [
          { name: 'forage', internalType: 'uint16', type: 'uint16' },
          { name: 'lightIntensity', internalType: 'uint16', type: 'uint16' },
          { name: 'waterSource', internalType: 'uint16', type: 'uint16' },
          { name: 'summerTemperature', internalType: 'uint16', type: 'uint16' },
          { name: 'winterTemperature', internalType: 'uint16', type: 'uint16' },
          { name: 'windSpeed', internalType: 'uint16', type: 'uint16' },
          { name: 'humidity', internalType: 'uint16', type: 'uint16' },
          { name: 'precipitation', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    name: 'submitSIData',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'supplyChain',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    name: 'triggerTemperatureViolation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SupplyChain
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const supplyChainAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'actorRegistryAddress',
        internalType: 'address',
        type: 'address',
      },
      { name: 'honeyTokenAddress', internalType: 'address', type: 'address' },
      { name: 'qualityIndexAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'actorRegistry',
    outputs: [
      { name: '', internalType: 'contract ActorRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'batchLocations',
    outputs: [
      { name: 'standId', internalType: 'uint256', type: 'uint256' },
      { name: 'quantity', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'batches',
    outputs: [
      { name: 'quantity', internalType: 'uint256', type: 'uint256' },
      { name: 'harvestYear', internalType: 'uint16', type: 'uint16' },
      { name: 'beekeeper', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'currentHolder',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'custodyHistory',
    outputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    name: 'getBatch',
    outputs: [
      {
        name: 'batch',
        internalType: 'struct SupplyChain.Batch',
        type: 'tuple',
        components: [
          { name: 'quantity', internalType: 'uint256', type: 'uint256' },
          { name: 'harvestYear', internalType: 'uint16', type: 'uint16' },
          { name: 'beekeeper', internalType: 'address', type: 'address' },
        ],
      },
      { name: 'holder', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'honeyToken',
    outputs: [
      { name: '', internalType: 'contract HoneyToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxSafeDurationMinutes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxSafeTemperatureCelsius',
    outputs: [{ name: '', internalType: 'int256', type: 'int256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextBatchId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'jarSizesGrams', internalType: 'uint32[]', type: 'uint32[]' },
      { name: 'jarCounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'processAndBottle',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'qualityIndex',
    outputs: [
      { name: '', internalType: 'contract QualityIndex', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    name: 'recordRetailReceipt',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'temperatureCelsius', internalType: 'int256', type: 'int256' },
      { name: 'durationMinutes', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordTransportData',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'temperatureCelsius', internalType: 'int256', type: 'int256' },
      { name: 'durationMinutes', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordWarehouseData',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'harvestYear', internalType: 'uint16', type: 'uint16' },
      { name: 'standIds', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'locationQuantities',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
    ],
    name: 'registerHarvestBatch',
    outputs: [{ name: 'batchId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'retailReceiptTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'minutesValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMaxSafeDuration',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'celsius', internalType: 'int256', type: 'int256' }],
    name: 'setMaxSafeTemperature',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'transferCustody',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__
 */
export const useReadActorRegistry = /*#__PURE__*/ createUseReadContract({
  abi: actorRegistryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"AWARD_BODY_ROLE"`
 */
export const useReadActorRegistryAwardBodyRole =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'AWARD_BODY_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"BEEKEEPER_ROLE"`
 */
export const useReadActorRegistryBeekeeperRole =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'BEEKEEPER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"BOTTLER_ROLE"`
 */
export const useReadActorRegistryBottlerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'BOTTLER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"CERTIFICATION_BODY_ROLE"`
 */
export const useReadActorRegistryCertificationBodyRole =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'CERTIFICATION_BODY_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadActorRegistryDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"LAB_ROLE"`
 */
export const useReadActorRegistryLabRole = /*#__PURE__*/ createUseReadContract({
  abi: actorRegistryAbi,
  functionName: 'LAB_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"LOGISTICS_ROLE"`
 */
export const useReadActorRegistryLogisticsRole =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'LOGISTICS_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"RETAILER_ROLE"`
 */
export const useReadActorRegistryRetailerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'RETAILER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"actors"`
 */
export const useReadActorRegistryActors = /*#__PURE__*/ createUseReadContract({
  abi: actorRegistryAbi,
  functionName: 'actors',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"certifications"`
 */
export const useReadActorRegistryCertifications =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'certifications',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"getActor"`
 */
export const useReadActorRegistryGetActor = /*#__PURE__*/ createUseReadContract(
  { abi: actorRegistryAbi, functionName: 'getActor' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"getAllActors"`
 */
export const useReadActorRegistryGetAllActors =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'getAllActors',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadActorRegistryGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadActorRegistryHasRole = /*#__PURE__*/ createUseReadContract({
  abi: actorRegistryAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadActorRegistrySupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: actorRegistryAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link actorRegistryAbi}__
 */
export const useWriteActorRegistry = /*#__PURE__*/ createUseWriteContract({
  abi: actorRegistryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteActorRegistryGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: actorRegistryAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"registerActor"`
 */
export const useWriteActorRegistryRegisterActor =
  /*#__PURE__*/ createUseWriteContract({
    abi: actorRegistryAbi,
    functionName: 'registerActor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteActorRegistryRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: actorRegistryAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteActorRegistryRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: actorRegistryAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"setCertification"`
 */
export const useWriteActorRegistrySetCertification =
  /*#__PURE__*/ createUseWriteContract({
    abi: actorRegistryAbi,
    functionName: 'setCertification',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link actorRegistryAbi}__
 */
export const useSimulateActorRegistry = /*#__PURE__*/ createUseSimulateContract(
  { abi: actorRegistryAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateActorRegistryGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: actorRegistryAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"registerActor"`
 */
export const useSimulateActorRegistryRegisterActor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: actorRegistryAbi,
    functionName: 'registerActor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateActorRegistryRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: actorRegistryAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateActorRegistryRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: actorRegistryAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link actorRegistryAbi}__ and `functionName` set to `"setCertification"`
 */
export const useSimulateActorRegistrySetCertification =
  /*#__PURE__*/ createUseSimulateContract({
    abi: actorRegistryAbi,
    functionName: 'setCertification',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link actorRegistryAbi}__
 */
export const useWatchActorRegistryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: actorRegistryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link actorRegistryAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchActorRegistryRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: actorRegistryAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link actorRegistryAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchActorRegistryRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: actorRegistryAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link actorRegistryAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchActorRegistryRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: actorRegistryAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__
 */
export const useReadHoneyToken = /*#__PURE__*/ createUseReadContract({
  abi: honeyTokenAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadHoneyTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: honeyTokenAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"balanceOfBatch"`
 */
export const useReadHoneyTokenBalanceOfBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: honeyTokenAbi,
    functionName: 'balanceOfBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"batchQuantities"`
 */
export const useReadHoneyTokenBatchQuantities =
  /*#__PURE__*/ createUseReadContract({
    abi: honeyTokenAbi,
    functionName: 'batchQuantities',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"getTokenData"`
 */
export const useReadHoneyTokenGetTokenData =
  /*#__PURE__*/ createUseReadContract({
    abi: honeyTokenAbi,
    functionName: 'getTokenData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadHoneyTokenIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: honeyTokenAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"jarTokenId"`
 */
export const useReadHoneyTokenJarTokenId = /*#__PURE__*/ createUseReadContract({
  abi: honeyTokenAbi,
  functionName: 'jarTokenId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"owner"`
 */
export const useReadHoneyTokenOwner = /*#__PURE__*/ createUseReadContract({
  abi: honeyTokenAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"processedBatches"`
 */
export const useReadHoneyTokenProcessedBatches =
  /*#__PURE__*/ createUseReadContract({
    abi: honeyTokenAbi,
    functionName: 'processedBatches',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"supplyChain"`
 */
export const useReadHoneyTokenSupplyChain = /*#__PURE__*/ createUseReadContract(
  { abi: honeyTokenAbi, functionName: 'supplyChain' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadHoneyTokenSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: honeyTokenAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"uri"`
 */
export const useReadHoneyTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: honeyTokenAbi,
  functionName: 'uri',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link honeyTokenAbi}__
 */
export const useWriteHoneyToken = /*#__PURE__*/ createUseWriteContract({
  abi: honeyTokenAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"markBatchProcessed"`
 */
export const useWriteHoneyTokenMarkBatchProcessed =
  /*#__PURE__*/ createUseWriteContract({
    abi: honeyTokenAbi,
    functionName: 'markBatchProcessed',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"mintBulkBatch"`
 */
export const useWriteHoneyTokenMintBulkBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: honeyTokenAbi,
    functionName: 'mintBulkBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"mintJars"`
 */
export const useWriteHoneyTokenMintJars = /*#__PURE__*/ createUseWriteContract({
  abi: honeyTokenAbi,
  functionName: 'mintJars',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteHoneyTokenRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: honeyTokenAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useWriteHoneyTokenSafeBatchTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: honeyTokenAbi,
    functionName: 'safeBatchTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteHoneyTokenSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: honeyTokenAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteHoneyTokenSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: honeyTokenAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"setSupplyChain"`
 */
export const useWriteHoneyTokenSetSupplyChain =
  /*#__PURE__*/ createUseWriteContract({
    abi: honeyTokenAbi,
    functionName: 'setSupplyChain',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteHoneyTokenTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: honeyTokenAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link honeyTokenAbi}__
 */
export const useSimulateHoneyToken = /*#__PURE__*/ createUseSimulateContract({
  abi: honeyTokenAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"markBatchProcessed"`
 */
export const useSimulateHoneyTokenMarkBatchProcessed =
  /*#__PURE__*/ createUseSimulateContract({
    abi: honeyTokenAbi,
    functionName: 'markBatchProcessed',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"mintBulkBatch"`
 */
export const useSimulateHoneyTokenMintBulkBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: honeyTokenAbi,
    functionName: 'mintBulkBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"mintJars"`
 */
export const useSimulateHoneyTokenMintJars =
  /*#__PURE__*/ createUseSimulateContract({
    abi: honeyTokenAbi,
    functionName: 'mintJars',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateHoneyTokenRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: honeyTokenAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useSimulateHoneyTokenSafeBatchTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: honeyTokenAbi,
    functionName: 'safeBatchTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateHoneyTokenSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: honeyTokenAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateHoneyTokenSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: honeyTokenAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"setSupplyChain"`
 */
export const useSimulateHoneyTokenSetSupplyChain =
  /*#__PURE__*/ createUseSimulateContract({
    abi: honeyTokenAbi,
    functionName: 'setSupplyChain',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link honeyTokenAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateHoneyTokenTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: honeyTokenAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link honeyTokenAbi}__
 */
export const useWatchHoneyTokenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: honeyTokenAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link honeyTokenAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchHoneyTokenApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: honeyTokenAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link honeyTokenAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchHoneyTokenOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: honeyTokenAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link honeyTokenAbi}__ and `eventName` set to `"TransferBatch"`
 */
export const useWatchHoneyTokenTransferBatchEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: honeyTokenAbi,
    eventName: 'TransferBatch',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link honeyTokenAbi}__ and `eventName` set to `"TransferSingle"`
 */
export const useWatchHoneyTokenTransferSingleEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: honeyTokenAbi,
    eventName: 'TransferSingle',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link honeyTokenAbi}__ and `eventName` set to `"URI"`
 */
export const useWatchHoneyTokenUriEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: honeyTokenAbi,
    eventName: 'URI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pricingModelAbi}__
 */
export const useReadPricingModel = /*#__PURE__*/ createUseReadContract({
  abi: pricingModelAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pricingModelAbi}__ and `functionName` set to `"actorRegistry"`
 */
export const useReadPricingModelActorRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: pricingModelAbi,
    functionName: 'actorRegistry',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pricingModelAbi}__ and `functionName` set to `"alpha"`
 */
export const useReadPricingModelAlpha = /*#__PURE__*/ createUseReadContract({
  abi: pricingModelAbi,
  functionName: 'alpha',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pricingModelAbi}__ and `functionName` set to `"calculatePrice"`
 */
export const useReadPricingModelCalculatePrice =
  /*#__PURE__*/ createUseReadContract({
    abi: pricingModelAbi,
    functionName: 'calculatePrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pricingModelAbi}__ and `functionName` set to `"floorPrices"`
 */
export const useReadPricingModelFloorPrices =
  /*#__PURE__*/ createUseReadContract({
    abi: pricingModelAbi,
    functionName: 'floorPrices',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pricingModelAbi}__ and `functionName` set to `"getPrice"`
 */
export const useReadPricingModelGetPrice = /*#__PURE__*/ createUseReadContract({
  abi: pricingModelAbi,
  functionName: 'getPrice',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pricingModelAbi}__ and `functionName` set to `"qualityIndex"`
 */
export const useReadPricingModelQualityIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: pricingModelAbi,
    functionName: 'qualityIndex',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pricingModelAbi}__
 */
export const useWritePricingModel = /*#__PURE__*/ createUseWriteContract({
  abi: pricingModelAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pricingModelAbi}__ and `functionName` set to `"setAlpha"`
 */
export const useWritePricingModelSetAlpha =
  /*#__PURE__*/ createUseWriteContract({
    abi: pricingModelAbi,
    functionName: 'setAlpha',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pricingModelAbi}__ and `functionName` set to `"setFloorPrice"`
 */
export const useWritePricingModelSetFloorPrice =
  /*#__PURE__*/ createUseWriteContract({
    abi: pricingModelAbi,
    functionName: 'setFloorPrice',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pricingModelAbi}__
 */
export const useSimulatePricingModel = /*#__PURE__*/ createUseSimulateContract({
  abi: pricingModelAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pricingModelAbi}__ and `functionName` set to `"setAlpha"`
 */
export const useSimulatePricingModelSetAlpha =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pricingModelAbi,
    functionName: 'setAlpha',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pricingModelAbi}__ and `functionName` set to `"setFloorPrice"`
 */
export const useSimulatePricingModelSetFloorPrice =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pricingModelAbi,
    functionName: 'setFloorPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link productGatewayAbi}__
 */
export const useReadProductGateway = /*#__PURE__*/ createUseReadContract({
  abi: productGatewayAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"actorRegistry"`
 */
export const useReadProductGatewayActorRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: productGatewayAbi,
    functionName: 'actorRegistry',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"getBatchData"`
 */
export const useReadProductGatewayGetBatchData =
  /*#__PURE__*/ createUseReadContract({
    abi: productGatewayAbi,
    functionName: 'getBatchData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"getPrice"`
 */
export const useReadProductGatewayGetPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: productGatewayAbi,
    functionName: 'getPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"getQualityData"`
 */
export const useReadProductGatewayGetQualityData =
  /*#__PURE__*/ createUseReadContract({
    abi: productGatewayAbi,
    functionName: 'getQualityData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"getTokenData"`
 */
export const useReadProductGatewayGetTokenData =
  /*#__PURE__*/ createUseReadContract({
    abi: productGatewayAbi,
    functionName: 'getTokenData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"honeyToken"`
 */
export const useReadProductGatewayHoneyToken =
  /*#__PURE__*/ createUseReadContract({
    abi: productGatewayAbi,
    functionName: 'honeyToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"pricingModel"`
 */
export const useReadProductGatewayPricingModel =
  /*#__PURE__*/ createUseReadContract({
    abi: productGatewayAbi,
    functionName: 'pricingModel',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"qualityIndex"`
 */
export const useReadProductGatewayQualityIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: productGatewayAbi,
    functionName: 'qualityIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"supplyChain"`
 */
export const useReadProductGatewaySupplyChain =
  /*#__PURE__*/ createUseReadContract({
    abi: productGatewayAbi,
    functionName: 'supplyChain',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link productGatewayAbi}__
 */
export const useWriteProductGateway = /*#__PURE__*/ createUseWriteContract({
  abi: productGatewayAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"setHoneyToken"`
 */
export const useWriteProductGatewaySetHoneyToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: productGatewayAbi,
    functionName: 'setHoneyToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"setPricingModel"`
 */
export const useWriteProductGatewaySetPricingModel =
  /*#__PURE__*/ createUseWriteContract({
    abi: productGatewayAbi,
    functionName: 'setPricingModel',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"setQualityIndex"`
 */
export const useWriteProductGatewaySetQualityIndex =
  /*#__PURE__*/ createUseWriteContract({
    abi: productGatewayAbi,
    functionName: 'setQualityIndex',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"setSupplyChain"`
 */
export const useWriteProductGatewaySetSupplyChain =
  /*#__PURE__*/ createUseWriteContract({
    abi: productGatewayAbi,
    functionName: 'setSupplyChain',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link productGatewayAbi}__
 */
export const useSimulateProductGateway =
  /*#__PURE__*/ createUseSimulateContract({ abi: productGatewayAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"setHoneyToken"`
 */
export const useSimulateProductGatewaySetHoneyToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: productGatewayAbi,
    functionName: 'setHoneyToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"setPricingModel"`
 */
export const useSimulateProductGatewaySetPricingModel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: productGatewayAbi,
    functionName: 'setPricingModel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"setQualityIndex"`
 */
export const useSimulateProductGatewaySetQualityIndex =
  /*#__PURE__*/ createUseSimulateContract({
    abi: productGatewayAbi,
    functionName: 'setQualityIndex',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link productGatewayAbi}__ and `functionName` set to `"setSupplyChain"`
 */
export const useSimulateProductGatewaySetSupplyChain =
  /*#__PURE__*/ createUseSimulateContract({
    abi: productGatewayAbi,
    functionName: 'setSupplyChain',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__
 */
export const useReadQualityIndex = /*#__PURE__*/ createUseReadContract({
  abi: qualityIndexAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"actorRegistry"`
 */
export const useReadQualityIndexActorRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'actorRegistry',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"awardCertificateCid"`
 */
export const useReadQualityIndexAwardCertificateCid =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'awardCertificateCid',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"batchStates"`
 */
export const useReadQualityIndexBatchStates =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'batchStates',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"calculateMCI"`
 */
export const useReadQualityIndexCalculateMci =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'calculateMCI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"calculatePHQI"`
 */
export const useReadQualityIndexCalculatePhqi =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'calculatePHQI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"calculateQI"`
 */
export const useReadQualityIndexCalculateQi =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'calculateQI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"calculateSI"`
 */
export const useReadQualityIndexCalculateSi =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'calculateSI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"checkGatekeeper"`
 */
export const useReadQualityIndexCheckGatekeeper =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'checkGatekeeper',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"gatekeeperFlags"`
 */
export const useReadQualityIndexGatekeeperFlags =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'gatekeeperFlags',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"getQualityData"`
 */
export const useReadQualityIndexGetQualityData =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'getQualityData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"mciData"`
 */
export const useReadQualityIndexMciData = /*#__PURE__*/ createUseReadContract({
  abi: qualityIndexAbi,
  functionName: 'mciData',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"originCid"`
 */
export const useReadQualityIndexOriginCid = /*#__PURE__*/ createUseReadContract(
  { abi: qualityIndexAbi, functionName: 'originCid' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"phqiReportCid"`
 */
export const useReadQualityIndexPhqiReportCid =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'phqiReportCid',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"qualityData"`
 */
export const useReadQualityIndexQualityData =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'qualityData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"supplyChain"`
 */
export const useReadQualityIndexSupplyChain =
  /*#__PURE__*/ createUseReadContract({
    abi: qualityIndexAbi,
    functionName: 'supplyChain',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link qualityIndexAbi}__
 */
export const useWriteQualityIndex = /*#__PURE__*/ createUseWriteContract({
  abi: qualityIndexAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"setSupplyChain"`
 */
export const useWriteQualityIndexSetSupplyChain =
  /*#__PURE__*/ createUseWriteContract({
    abi: qualityIndexAbi,
    functionName: 'setSupplyChain',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"submitAward"`
 */
export const useWriteQualityIndexSubmitAward =
  /*#__PURE__*/ createUseWriteContract({
    abi: qualityIndexAbi,
    functionName: 'submitAward',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"submitOrigin"`
 */
export const useWriteQualityIndexSubmitOrigin =
  /*#__PURE__*/ createUseWriteContract({
    abi: qualityIndexAbi,
    functionName: 'submitOrigin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"submitPHQIData"`
 */
export const useWriteQualityIndexSubmitPhqiData =
  /*#__PURE__*/ createUseWriteContract({
    abi: qualityIndexAbi,
    functionName: 'submitPHQIData',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"submitSIData"`
 */
export const useWriteQualityIndexSubmitSiData =
  /*#__PURE__*/ createUseWriteContract({
    abi: qualityIndexAbi,
    functionName: 'submitSIData',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"triggerTemperatureViolation"`
 */
export const useWriteQualityIndexTriggerTemperatureViolation =
  /*#__PURE__*/ createUseWriteContract({
    abi: qualityIndexAbi,
    functionName: 'triggerTemperatureViolation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link qualityIndexAbi}__
 */
export const useSimulateQualityIndex = /*#__PURE__*/ createUseSimulateContract({
  abi: qualityIndexAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"setSupplyChain"`
 */
export const useSimulateQualityIndexSetSupplyChain =
  /*#__PURE__*/ createUseSimulateContract({
    abi: qualityIndexAbi,
    functionName: 'setSupplyChain',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"submitAward"`
 */
export const useSimulateQualityIndexSubmitAward =
  /*#__PURE__*/ createUseSimulateContract({
    abi: qualityIndexAbi,
    functionName: 'submitAward',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"submitOrigin"`
 */
export const useSimulateQualityIndexSubmitOrigin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: qualityIndexAbi,
    functionName: 'submitOrigin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"submitPHQIData"`
 */
export const useSimulateQualityIndexSubmitPhqiData =
  /*#__PURE__*/ createUseSimulateContract({
    abi: qualityIndexAbi,
    functionName: 'submitPHQIData',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"submitSIData"`
 */
export const useSimulateQualityIndexSubmitSiData =
  /*#__PURE__*/ createUseSimulateContract({
    abi: qualityIndexAbi,
    functionName: 'submitSIData',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link qualityIndexAbi}__ and `functionName` set to `"triggerTemperatureViolation"`
 */
export const useSimulateQualityIndexTriggerTemperatureViolation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: qualityIndexAbi,
    functionName: 'triggerTemperatureViolation',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link qualityIndexAbi}__
 */
export const useWatchQualityIndexEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: qualityIndexAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link qualityIndexAbi}__ and `eventName` set to `"PHQIDataSubmitted"`
 */
export const useWatchQualityIndexPhqiDataSubmittedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: qualityIndexAbi,
    eventName: 'PHQIDataSubmitted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__
 */
export const useReadSupplyChain = /*#__PURE__*/ createUseReadContract({
  abi: supplyChainAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"actorRegistry"`
 */
export const useReadSupplyChainActorRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: supplyChainAbi,
    functionName: 'actorRegistry',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"batchLocations"`
 */
export const useReadSupplyChainBatchLocations =
  /*#__PURE__*/ createUseReadContract({
    abi: supplyChainAbi,
    functionName: 'batchLocations',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"batches"`
 */
export const useReadSupplyChainBatches = /*#__PURE__*/ createUseReadContract({
  abi: supplyChainAbi,
  functionName: 'batches',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"currentHolder"`
 */
export const useReadSupplyChainCurrentHolder =
  /*#__PURE__*/ createUseReadContract({
    abi: supplyChainAbi,
    functionName: 'currentHolder',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"custodyHistory"`
 */
export const useReadSupplyChainCustodyHistory =
  /*#__PURE__*/ createUseReadContract({
    abi: supplyChainAbi,
    functionName: 'custodyHistory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"getBatch"`
 */
export const useReadSupplyChainGetBatch = /*#__PURE__*/ createUseReadContract({
  abi: supplyChainAbi,
  functionName: 'getBatch',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"honeyToken"`
 */
export const useReadSupplyChainHoneyToken = /*#__PURE__*/ createUseReadContract(
  { abi: supplyChainAbi, functionName: 'honeyToken' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"maxSafeDurationMinutes"`
 */
export const useReadSupplyChainMaxSafeDurationMinutes =
  /*#__PURE__*/ createUseReadContract({
    abi: supplyChainAbi,
    functionName: 'maxSafeDurationMinutes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"maxSafeTemperatureCelsius"`
 */
export const useReadSupplyChainMaxSafeTemperatureCelsius =
  /*#__PURE__*/ createUseReadContract({
    abi: supplyChainAbi,
    functionName: 'maxSafeTemperatureCelsius',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"nextBatchId"`
 */
export const useReadSupplyChainNextBatchId =
  /*#__PURE__*/ createUseReadContract({
    abi: supplyChainAbi,
    functionName: 'nextBatchId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"qualityIndex"`
 */
export const useReadSupplyChainQualityIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: supplyChainAbi,
    functionName: 'qualityIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"retailReceiptTimestamp"`
 */
export const useReadSupplyChainRetailReceiptTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: supplyChainAbi,
    functionName: 'retailReceiptTimestamp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link supplyChainAbi}__
 */
export const useWriteSupplyChain = /*#__PURE__*/ createUseWriteContract({
  abi: supplyChainAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"processAndBottle"`
 */
export const useWriteSupplyChainProcessAndBottle =
  /*#__PURE__*/ createUseWriteContract({
    abi: supplyChainAbi,
    functionName: 'processAndBottle',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"recordRetailReceipt"`
 */
export const useWriteSupplyChainRecordRetailReceipt =
  /*#__PURE__*/ createUseWriteContract({
    abi: supplyChainAbi,
    functionName: 'recordRetailReceipt',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"recordTransportData"`
 */
export const useWriteSupplyChainRecordTransportData =
  /*#__PURE__*/ createUseWriteContract({
    abi: supplyChainAbi,
    functionName: 'recordTransportData',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"recordWarehouseData"`
 */
export const useWriteSupplyChainRecordWarehouseData =
  /*#__PURE__*/ createUseWriteContract({
    abi: supplyChainAbi,
    functionName: 'recordWarehouseData',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"registerHarvestBatch"`
 */
export const useWriteSupplyChainRegisterHarvestBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: supplyChainAbi,
    functionName: 'registerHarvestBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"setMaxSafeDuration"`
 */
export const useWriteSupplyChainSetMaxSafeDuration =
  /*#__PURE__*/ createUseWriteContract({
    abi: supplyChainAbi,
    functionName: 'setMaxSafeDuration',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"setMaxSafeTemperature"`
 */
export const useWriteSupplyChainSetMaxSafeTemperature =
  /*#__PURE__*/ createUseWriteContract({
    abi: supplyChainAbi,
    functionName: 'setMaxSafeTemperature',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"transferCustody"`
 */
export const useWriteSupplyChainTransferCustody =
  /*#__PURE__*/ createUseWriteContract({
    abi: supplyChainAbi,
    functionName: 'transferCustody',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link supplyChainAbi}__
 */
export const useSimulateSupplyChain = /*#__PURE__*/ createUseSimulateContract({
  abi: supplyChainAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"processAndBottle"`
 */
export const useSimulateSupplyChainProcessAndBottle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: supplyChainAbi,
    functionName: 'processAndBottle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"recordRetailReceipt"`
 */
export const useSimulateSupplyChainRecordRetailReceipt =
  /*#__PURE__*/ createUseSimulateContract({
    abi: supplyChainAbi,
    functionName: 'recordRetailReceipt',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"recordTransportData"`
 */
export const useSimulateSupplyChainRecordTransportData =
  /*#__PURE__*/ createUseSimulateContract({
    abi: supplyChainAbi,
    functionName: 'recordTransportData',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"recordWarehouseData"`
 */
export const useSimulateSupplyChainRecordWarehouseData =
  /*#__PURE__*/ createUseSimulateContract({
    abi: supplyChainAbi,
    functionName: 'recordWarehouseData',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"registerHarvestBatch"`
 */
export const useSimulateSupplyChainRegisterHarvestBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: supplyChainAbi,
    functionName: 'registerHarvestBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"setMaxSafeDuration"`
 */
export const useSimulateSupplyChainSetMaxSafeDuration =
  /*#__PURE__*/ createUseSimulateContract({
    abi: supplyChainAbi,
    functionName: 'setMaxSafeDuration',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"setMaxSafeTemperature"`
 */
export const useSimulateSupplyChainSetMaxSafeTemperature =
  /*#__PURE__*/ createUseSimulateContract({
    abi: supplyChainAbi,
    functionName: 'setMaxSafeTemperature',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link supplyChainAbi}__ and `functionName` set to `"transferCustody"`
 */
export const useSimulateSupplyChainTransferCustody =
  /*#__PURE__*/ createUseSimulateContract({
    abi: supplyChainAbi,
    functionName: 'transferCustody',
  })
