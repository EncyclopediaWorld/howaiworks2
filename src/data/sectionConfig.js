export const sections = [
  {
    id: 1,
    title: '线性模型与贝叶斯',
    demos: [
      { id: 'demo-lr', label: '线性回归', desc: '线性回归拟合与预测。', module: '/src/demos/linearRegression.js', mount: 'mountLinearRegression', unmount: 'unmountLinearRegression' },
      { id: 'demo-perceptron', label: '感知机', desc: '感知机决策边界演示。', module: '/src/demos/perceptron.js', mount: 'mountPerceptron', unmount: 'unmountPerceptron' },
      { id: 'demo-adaline', label: 'Adaline', desc: 'ADALINE 权重更新示例。', module: '/src/demos/adaline.js', mount: 'mountAdaline', unmount: 'unmountAdaline' },
      { id: 'demo-bayes', label: '朴素贝叶斯', desc: '概率与条件独立示例。', module: '/src/demos/bayes.js', mount: 'mountBayes', unmount: 'unmountBayes' }
    ]
  },
  {
    id: 2,
    title: '非参数方法与概率',
    demos: [
      { id: 'demo-knn', label: 'kNN', desc: '最近邻分类与距离测度。', module: '/src/demos/knn.js', mount: 'mountKnn', unmount: 'unmountKnn' },
      { id: 'demo-nb', label: 'Naive Bayes', desc: '朴素贝叶斯预测示例。', module: '/src/demos/naiveBayes.js', mount: 'mountNaiveBayes', unmount: 'unmountNaiveBayes' },
      { id: 'demo-chain', label: '链式规则', desc: '概率乘法和条件概率。', module: '/src/demos/chainRule.js', mount: 'mountChainRule', unmount: 'unmountChainRule' }
    ]
  },
  {
    id: 3,
    title: '深度学习核心算法',
    demos: [
      { id: 'demo-neo', label: 'Neocognitron', desc: '早期卷积网络层次结构。', module: '/src/demos/neocognitron.js', mount: 'mountNeocognitron', unmount: 'unmountNeocognitron' },
      { id: 'demo-rnn', label: '循环神经网络', desc: '序列信息累积与隐状态。', module: '/src/demos/rnn.js', mount: 'mountRnn', unmount: 'unmountRnn' },
      { id: 'demo-boltz', label: 'Boltzmann 机', desc: '能量模型和抽样。', module: '/src/demos/boltzmann.js', mount: 'mountBoltzmann', unmount: 'unmountBoltzmann' },
      { id: 'demo-bp', label: '反向传播', desc: '误差反传与权重更新。', module: '/src/demos/backpropagation.js', mount: 'mountBackpropagation', unmount: 'unmountBackpropagation' },
      { id: 'demo-tree', label: '决策树', desc: '信息增益与树状分类。', module: '/src/demos/decisionTree.js', mount: 'mountDecisionTree', unmount: 'unmountDecisionTree' }
    ]
  },
  {
    id: 4,
    title: '卷积与集成方法',
    demos: [
      { id: 'demo-cnn', label: 'CNN / LeNet', desc: '卷积与池化特征提取。', module: '/src/demos/section4to8.js', mount: 'mountCnn', unmount: 'unmountCnn' },
      { id: 'demo-lstm', label: 'LSTM', desc: '门控记忆单元增强长期依赖。', module: '/src/demos/section4to8.js', mount: 'mountLstm', unmount: 'unmountLstm' },
      { id: 'demo-svm', label: 'SVM', desc: '最大间隔分类与支持向量。', module: '/src/demos/section4to8.js', mount: 'mountSvm', unmount: 'unmountSvm' },
      { id: 'demo-gmm', label: 'GMM + EM', desc: '高斯混合聚类与 EM 迭代。', module: '/src/demos/section4to8.js', mount: 'mountGmm', unmount: 'unmountGmm' },
      { id: 'demo-rf', label: '随机森林', desc: '决策树集成减少方差。', module: '/src/demos/section4to8.js', mount: 'mountRf', unmount: 'unmountRf' },
      { id: 'demo-ada', label: 'AdaBoost', desc: '弱分类器加权提升。', module: '/src/demos/section4to8.js', mount: 'mountAda', unmount: 'unmountAda' }
    ]
  },
  {
    id: 5,
    title: '自编码与增强树',
    demos: [
      { id: 'demo-dbn', label: 'DBN', desc: '深度置信网络与预训练。', module: '/src/demos/section4to8.js', mount: 'mountDbn', unmount: 'unmountDbn' },
      { id: 'demo-sae', label: '稀疏自编码', desc: '约束表示学习。', module: '/src/demos/section4to8.js', mount: 'mountSae', unmount: 'unmountSae' },
      { id: 'demo-dae', label: '去噪自编码', desc: '噪声鲁棒特征。', module: '/src/demos/section4to8.js', mount: 'mountDae', unmount: 'unmountDae' },
      { id: 'demo-gbdt', label: 'GBDT', desc: '梯度提升树残差拟合。', module: '/src/demos/section4to8.js', mount: 'mountGbdt', unmount: 'unmountGbdt' },
      { id: 'demo-nnlm', label: 'NNLM', desc: '神经语言模型预测。', module: '/src/demos/section4to8.js', mount: 'mountNnlm', unmount: 'unmountNnlm' }
    ]
  },
  {
    id: 6,
    title: '深度网络与生成模型',
    demos: [
      { id: 'demo-alex', label: 'AlexNet', desc: '大规模图像分类网络。', module: '/src/demos/section4to8.js', mount: 'mountAlex', unmount: 'unmountAlex' },
      { id: 'demo-drop', label: 'Dropout', desc: '随机失活正则化。', module: '/src/demos/section4to8.js', mount: 'mountDrop', unmount: 'unmountDrop' },
      { id: 'demo-w2v', label: 'Word2Vec', desc: '词向量语义关系。', module: '/src/demos/section4to8.js', mount: 'mountW2v', unmount: 'unmountW2v' },
      { id: 'demo-vae', label: 'VAE', desc: '变分自编码生成。', module: '/src/demos/section4to8.js', mount: 'mountVae', unmount: 'unmountVae' },
      { id: 'demo-gan', label: 'GAN', desc: '对抗生成器与判别器。', module: '/src/demos/section4to8.js', mount: 'mountGan', unmount: 'unmountGan' },
      { id: 'demo-attn', label: 'Seq2Seq + Attention', desc: '注意力机制。', module: '/src/demos/section4to8.js', mount: 'mountAttn', unmount: 'unmountAttn' },
      { id: 'demo-resnet', label: 'ResNet', desc: '残差连接深层训练。', module: '/src/demos/section4to8.js', mount: 'mountResnet', unmount: 'unmountResnet' },
      { id: 'demo-bn', label: 'BatchNorm', desc: '批标准化加速收敛。', module: '/src/demos/section4to8.js', mount: 'mountBn', unmount: 'unmountBn' }
    ]
  },
  {
    id: 7,
    title: '语言模型与GAN 进阶',
    demos: [
      { id: 'demo-transformer', label: 'Transformer', desc: '自注意力序列建模。', module: '/src/demos/section4to8.js', mount: 'mountTransformer', unmount: 'unmountTransformer' },
      { id: 'demo-elmo', label: 'ELMo', desc: '上下文词嵌入分数。', module: '/src/demos/section4to8.js', mount: 'mountElmo', unmount: 'unmountElmo' },
      { id: 'demo-bert', label: 'BERT', desc: '双向编码理解任务。', module: '/src/demos/section4to8.js', mount: 'mountBert', unmount: 'unmountBert' },
      { id: 'demo-stylegan', label: 'StyleGAN', desc: '高分辨率生成。', module: '/src/demos/section4to8.js', mount: 'mountStylegan', unmount: 'unmountStylegan' },
      { id: 'demo-xgboost', label: 'XGBoost', desc: '高效正则化梯度提升。', module: '/src/demos/section4to8.js', mount: 'mountXgboost', unmount: 'unmountXgboost' }
    ]
  },
  {
    id: 8,
    title: '新潮网络与生成框架',
    demos: [
      { id: 'demo-vit', label: 'ViT', desc: '图像补丁 Transformer。', module: '/src/demos/section4to8.js', mount: 'mountVit', unmount: 'unmountVit' },
      { id: 'demo-diffusion', label: 'Diffusion', desc: '扩散模型生成过程。', module: '/src/demos/section4to8.js', mount: 'mountDiffusion', unmount: 'unmountDiffusion' },
      { id: 'demo-rl', label: '深度强化学习', desc: '策略/价值迭代示例。', module: '/src/demos/section4to8.js', mount: 'mountRl', unmount: 'unmountRl' }
    ]
  }
]
