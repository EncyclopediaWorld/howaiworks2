export const sectionContent = {
  1: {
    id: 1,
    era: 'Section I · 1800s–1960s',
    color: 'var(--a1)',
    title: 'The Dawn of Statistical Learning',
    desc: "From Gauss's least squares to Rosenblatt's perceptron — mathematics lays the foundation for machine intelligence.",
    prev: { label: 'Home', to: '/' },
    next: { label: 'Section II', to: '/section/2' },
    models: [
      { id: 'demo-lr', year: '1805', name: 'Linear Regression', paper: 'https://en.wikipedia.org/wiki/Least_squares', text: 'Legendre & Gauss\'s method of least squares — fit a straight line by minimizing squared errors.', lineage: 'Foundation for optimization-based learning; leads to Adaline and Backprop.', formula: 'y = wx + b  minimize Σ(yᵢ - (wxᵢ + b))²', module: '/src/demos/linearRegression.js', mount: 'mountLinearRegression' },
      { id: 'demo-bayes', year: '1812', name: 'Bayes\' Theorem', paper: 'https://en.wikipedia.org/wiki/Bayes%27_theorem', text: 'Update belief from evidence with prior*likelihood → posterior.', lineage: 'Enables Naive Bayes and GMM+EM clustering.', formula: 'P(A|B)=P(B|A)P(A)/P(B)', module: '/src/demos/bayes.js', mount: 'mountBayes' },
      { id: 'demo-markov', year: '1906', name: 'Markov Chain', paper: 'https://en.wikipedia.org/wiki/Markov_chain', text: 'Next state depends only on current state.', lineage: 'Motivates RNN memory and Boltzmann sampling.', formula: 'P(Xₙ₊₁|Xₙ,...)=P(Xₙ₊₁|Xₙ)', module: '/src/demos/genericDemo.js', mount: 'mountGeneric' },
      { id: 'demo-perceptron', year: '1958', name: 'Perceptron', paper: 'https://doi.org/10.1037/h0042519', text: 'Weighted sum with step activation, learns linearly separable classes.', lineage: 'Precedes Adaline and Backpropagation.', formula: 'y = step(w·x + b)', module: '/src/demos/perceptron.js', mount: 'mountPerceptron' },
      { id: 'demo-adaline', year: '1960', name: 'Adaline', paper: 'https://en.wikipedia.org/wiki/ADALINE', text: 'Uses continuous gradient descent on linear neuron output before activation.', lineage: 'Improves Perceptron with LMS; inspires Backpropagation.', formula: 'Δw = η(target − z)x', module: '/src/demos/adaline.js', mount: 'mountAdaline' }
    ]
  },
  2: {
    id: 2,
    era: 'Section II · 1960s–1970s',
    color: 'var(--a7)',
    title: 'Early Exploration & The First AI Winter',
    desc: 'k-NN, Naive Bayes, and the chain rule — simple but powerful ideas that still matter today.',
    prev: { label: 'Section I', to: '/section/1' },
    next: { label: 'Section III', to: '/section/3' },
    models: [
      { id: 'demo-knn', year: '1967', name: 'k-Nearest Neighbors', paper: 'https://doi.org/10.1109/TIT.1967.1053964', text: 'Classify by majority vote of nearest neighbors.', lineage: 'Distance-based non-parametric alternative to linear boundaries.', formula: 'prediction = mode(labels of k nearest neighbors)', module: '/src/demos/knn.js', mount: 'mountKnn' },
      { id: 'demo-nb', year: '1960s', name: 'Naive Bayes Classifier', paper: 'https://en.wikipedia.org/wiki/Naive_Bayes_classifier', text: 'Assumes feature independence for fast probabilistic classification.', lineage: 'Rooted in Bayes’ Theorem; used in early spam filtering.', formula: 'P(class|x) ∝ P(class)∏P(xᵢ|class)', module: '/src/demos/naiveBayes.js', mount: 'mountNaiveBayes' },
      { id: 'demo-chain', year: '1970', name: 'Automatic Differentiation', paper: 'https://en.wikipedia.org/wiki/Automatic_differentiation', text: 'Compute gradients backward through graphs.', lineage: 'Basis for backpropagation.', formula: '∂L/∂x = ∂L/∂z·∂z/∂y·∂y/∂x', module: '/src/demos/chainRule.js', mount: 'mountChainRule' }
    ]
  },
  3: {
    id: 3,
    era: 'Section III · 1980s',
    color: 'var(--a3)',
    title: 'The Revival & Classical ML',
    desc: 'Neocognitron, RNN, Boltzmann, Backpropagation, Decision Trees.',
    prev: { label: 'Section II', to: '/section/2' },
    next: { label: 'Section IV', to: '/section/4' },
    models: [
      { id: 'demo-neo', year: '1980', name: 'Neocognitron', paper: 'https://en.wikipedia.org/wiki/Neocognitron', text: 'Hierarchy of convolution + pooling for pattern recognition.', lineage: 'Prototype of modern CNNs.', formula: 'Layered conv+pool', module: '/src/demos/neocognitron.js', mount: 'mountNeocognitron' },
      { id: 'demo-rnn', year: '1986', name: 'Recurrent Neural Network', paper: 'https://en.wikipedia.org/wiki/Recurrent_neural_network', text: 'Hidden state carries memory across sequence.', lineage: 'Foundation for LSTM and seq models.', formula: 'hₜ=tanh(Whₜ₋₁+Uxₜ+b)', module: '/src/demos/rnn.js', mount: 'mountRnn' },
      { id: 'demo-boltz', year: '1985', name: 'Boltzmann Machine', paper: 'https://en.wikipedia.org/wiki/Boltzmann_machine', text: 'Energy-based stochastic network for sampling and learning.', lineage: 'Early generative model with latent structure.', formula: 'E(v,h)=−vᵀWh−bᵀv−cᵀh', module: '/src/demos/boltzmann.js', mount: 'mountBoltzmann' },
      { id: 'demo-bp', year: '1986', name: 'Backpropagation', paper: 'https://en.wikipedia.org/wiki/Backpropagation', text: 'Backprop error gradients through deep networks.', lineage: 'Key method for training deep nets.', formula: 'Δw=−η∂L/∂w', module: '/src/demos/backpropagation.js', mount: 'mountBackpropagation' },
      { id: 'demo-tree', year: '1986', name: 'Decision Tree', paper: 'https://en.wikipedia.org/wiki/Decision_tree_learning', text: 'Recursive splits via entropy/gini, transparent rules.', lineage: 'Basis for Random Forest and boosting.', formula: 'IG = H(parent) − Σ(nᵢ/n)H(childᵢ)', module: '/src/demos/decisionTree.js', mount: 'mountDecisionTree' }
    ]
  },
  4: {
    id: 4,
    era: 'Section IV · 1990s–2001',
    color: 'var(--a2)',
    title: 'Modern CNNs and Ensemble Learning',
    desc: 'Convolutional nets rise, and tree ensembles bring reliability.',
    prev: { label: 'Section III', to: '/section/3' },
    next: { label: 'Section V', to: '/section/5' },
    models: [
      { id: 'demo-cnn', year: '1998', name: 'CNN / LeNet', paper: 'https://en.wikipedia.org/wiki/LeNet', text: 'Convolution+pooling network for digits.', lineage: 'First practical deep CNN.', formula: 'Conv->ReLU->Pool', module: '/src/demos/section4to8.js', mount: 'mountCnn' },
      { id: 'demo-lstm', year: '1997', name: 'LSTM', paper: 'https://en.wikipedia.org/wiki/Long_short-term_memory', text: 'Gate-controlled memory cell for long dependencies.', lineage: 'Solves vanishing gradient problems in RNNs.', formula: 'f,o,i,g gates', module: '/src/demos/section4to8.js', mount: 'mountLstm' },
      { id: 'demo-svm', year: '1995', name: 'SVM', paper: 'https://en.wikipedia.org/wiki/Support-vector_machine', text: 'Max-margin classifier with kernels.', lineage: 'Used for reliable classification.', formula: 'min||w||² s.t. y(w·x+b)≥1', module: '/src/demos/section4to8.js', mount: 'mountSvm' },
      { id: 'demo-gmm', year: '1998', name: 'GMM + EM', paper: 'https://en.wikipedia.org/wiki/Expectation%E2%80%93maximization_algorithm', text: 'Probabilistic clustering via EM.', lineage: 'Probabilistic mixture modeling.', formula: 'Q(θ|θᵏ)=E[log p(X,Z|θ)]', module: '/src/demos/section4to8.js', mount: 'mountGmm' },
      { id: 'demo-rf', year: '2001', name: 'Random Forest', paper: 'https://en.wikipedia.org/wiki/Random_forest', text: 'Ensemble of random decision trees.', lineage: 'Combines many trees for robustness.', formula: 'avg(tree_i(x))', module: '/src/demos/section4to8.js', mount: 'mountRf' },
      { id: 'demo-ada', year: '1995', name: 'AdaBoost', paper: 'https://en.wikipedia.org/wiki/AdaBoost', text: 'Sequentially reweighted weak learners.', lineage: 'Foundation for modern boosting methods.', formula: 'αₜ=0.5 ln((1-εₜ)/εₜ)', module: '/src/demos/section4to8.js', mount: 'mountAda' }
    ]
  },
  5: {
    id: 5,
    era: 'Section V · 2000s',
    color: 'var(--a4)',
    title: 'Deep Foundations',
    desc: 'Deep belief nets, sparse autoencoders, and boosted trees.',
    prev: { label: 'Section IV', to: '/section/4' },
    next: { label: 'Section VI', to: '/section/6' },
    models: [
      { id: 'demo-dbn', year: '2006', name: 'Deep Belief Network', paper: 'https://en.wikipedia.org/wiki/Deep_belief_network', text: 'Stacked RBMs for pretraining.', lineage: 'Pretraining for deep nets.', module: '/src/demos/section4to8.js', mount: 'mountDbn' },
      { id: 'demo-sae', year: '2006', name: 'Sparse Autoencoder', paper: 'https://en.wikipedia.org/wiki/Sparse_autoencoder', text: 'Encodes data with sparsity constraints.', lineage: 'Learned compact features.', module: '/src/demos/section4to8.js', mount: 'mountSae' },
      { id: 'demo-dae', year: '2008', name: 'Denoising Autoencoder', paper: 'https://en.wikipedia.org/wiki/Denoising_autoencoder', text: 'Reconstruct clean states from noise.', lineage: 'Robust representation learning.', module: '/src/demos/section4to8.js', mount: 'mountDae' },
      { id: 'demo-gbdt', year: '2001', name: 'GBDT', paper: 'https://en.wikipedia.org/wiki/Gradient_boosting', text: 'Gradient descent in function space with trees.', lineage: 'Boosted tree state-of-art.', module: '/src/demos/section4to8.js', mount: 'mountGbdt' },
      { id: 'demo-nnlm', year: '2003', name: 'NNLM', paper: 'https://en.wikipedia.org/wiki/Neural_network_language_model', text: 'Predict word sequences with neural nets.', lineage: 'Word embeddings and language modeling.', module: '/src/demos/section4to8.js', mount: 'mountNnlm' }
    ]
  },
  6: {
    id: 6,
    era: 'Section VI · 2012–2015',
    color: 'var(--a5)',
    title: 'The Deep Learning Explosion',
    desc: 'AlexNet, Dropout, Word2Vec, GAN, ResNet, BatchNorm.',
    prev: { label: 'Section V', to: '/section/5' },
    next: { label: 'Section VII', to: '/section/7' },
    models: [
      { id: 'demo-alex', year: '2012', name: 'AlexNet', paper: 'https://en.wikipedia.org/wiki/AlexNet', text: 'Deep CNN with dropout.', module: '/src/demos/section4to8.js', mount: 'mountAlex' },
      { id: 'demo-drop', year: '2014', name: 'Dropout', paper: 'https://en.wikipedia.org/wiki/Dropout_(neural_networks)', text: 'Regularization by dropping units.', module: '/src/demos/section4to8.js', mount: 'mountDrop' },
      { id: 'demo-w2v', year: '2013', name: 'Word2Vec', paper: 'https://en.wikipedia.org/wiki/Word2vec', text: 'Neural word embeddings.', module: '/src/demos/section4to8.js', mount: 'mountW2v' },
      { id: 'demo-vae', year: '2013', name: 'VAE', paper: 'https://en.wikipedia.org/wiki/Variational_autoencoder', text: 'Probabilistic latent representations.', module: '/src/demos/section4to8.js', mount: 'mountVae' },
      { id: 'demo-gan', year: '2014', name: 'GAN', paper: 'https://en.wikipedia.org/wiki/Generative_adversarial_network', text: 'Adversarial generator/discriminator.', module: '/src/demos/section4to8.js', mount: 'mountGan' },
      { id: 'demo-attn', year: '2014', name: 'Seq2Seq + Attention', paper: 'https://arxiv.org/abs/1409.0473', text: 'Attention for sequence models.', module: '/src/demos/section4to8.js', mount: 'mountAttn' },
      { id: 'demo-resnet', year: '2015', name: 'ResNet', paper: 'https://arxiv.org/abs/1512.03385', text: 'Residual connections for very deep nets.', module: '/src/demos/section4to8.js', mount: 'mountResnet' },
      { id: 'demo-bn', year: '2015', name: 'BatchNorm', paper: 'https://arxiv.org/abs/1502.03167', text: 'Normalize internal activations.', module: '/src/demos/section4to8.js', mount: 'mountBn' }
    ]
  },
  7: {
    id: 7,
    era: 'Section VII · 2016–2019',
    color: 'var(--a6)',
    title: 'The Transformer Revolution',
    desc: 'Transformer, BERT, GPT-2, and style generation reshape ML.',
    prev: { label: 'Section VI', to: '/section/6' },
    next: { label: 'Section VIII', to: '/section/8' },
    models: [
      { id: 'demo-xgboost', year: '2016', name: 'XGBoost', paper: 'https://xgboost.ai', text: 'Efficient gradient boosted trees.', module: '/src/demos/section4to8.js', mount: 'mountXgboost' },
      { id: 'demo-transformer', year: '2017', name: 'Transformer', paper: 'https://arxiv.org/abs/1706.03762', text: 'Self-attention for sequence modeling.', module: '/src/demos/section4to8.js', mount: 'mountTransformer' },
      { id: 'demo-elmo', year: '2018', name: 'ELMo', paper: 'https://arxiv.org/abs/1802.05365', text: 'Contextual word embeddings from BiLSTM.', module: '/src/demos/section4to8.js', mount: 'mountElmo' },
      { id: 'demo-bert', year: '2018', name: 'BERT', paper: 'https://arxiv.org/abs/1810.04805', text: 'Bidirectional transformer pretraining.', module: '/src/demos/section4to8.js', mount: 'mountBert' },
      { id: 'demo-stylegan', year: '2018', name: 'StyleGAN', paper: 'https://arxiv.org/abs/1812.04948', text: 'Control over image generation styles.', module: '/src/demos/section4to8.js', mount: 'mountStylegan' },
      { id: 'demo-gpt2', year: '2019', name: 'GPT-2', paper: 'https://openai.com/blog/better-language-models', text: 'Large-scale generative language model.', module: '/src/demos/section4to8.js', mount: 'mountGpt2' }
    ]
  },
  8: {
    id: 8,
    era: 'Section VIII · 2020–2024',
    color: 'var(--a8)',
    title: 'Foundation Models & AGI Era',
    desc: 'GPT-3, ViT, CLIP, Diffusion, and interactive agents.',
    prev: { label: 'Section VII', to: '/section/7' },
    next: null,
    models: [
      { id: 'demo-vit', year: '2020', name: 'ViT', paper: 'https://arxiv.org/abs/2010.11929', text: 'Vision Transformer on image patches.', module: '/src/demos/section4to8.js', mount: 'mountVit' },
      { id: 'demo-diffusion', year: '2020', name: 'Diffusion', paper: 'https://arxiv.org/abs/2006.11239', text: 'Denoising generative process.', module: '/src/demos/section4to8.js', mount: 'mountDiffusion' },
      { id: 'demo-rl', year: '2022', name: 'Deep RL', paper: 'https://deepmind.com', text: 'Policy/value iteration for agents.', module: '/src/demos/section4to8.js', mount: 'mountRl' },
      { id: 'demo-gpt3', year: '2020', name: 'GPT-3', paper: 'https://arxiv.org/abs/2005.14165', text: 'Large autoregressive language model.', module: '/src/demos/section4to8.js', mount: 'mountGpt3' },
      { id: 'demo-chatgpt', year: '2022', name: 'ChatGPT', paper: 'https://openai.com/blog/chatgpt', text: 'Conversational RLHF model.', module: '/src/demos/section4to8.js', mount: 'mountChatgpt' }
    ]
  }
}
