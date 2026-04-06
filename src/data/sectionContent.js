export const sectionContent = {
  "1": {
    "id": 1,
    "era": "Section I · 1800s–1960s",
    "color": "var(--a1)",
    "progress": "linear-gradient(90deg,var(--a1),var(--a2))",
    "title": "The Dawn of Statistical Learning",
    "desc": "From Gauss's least squares to Rosenblatt's perceptron — mathematics lays the foundation for machine intelligence.",
    "prev": {
      "label": "Home",
      "to": "/"
    },
    "next": {
      "label": "Section 2",
      "to": "/section/2"
    },
    "models": [
      {
        "id": "demo-lr",
        "anchorId": "model-linreg",
        "year": "1805",
        "name": "Linear Regression",
        "paper": "https://en.wikipedia.org/wiki/Least_squares",
        "text": "Legendre & Gauss's method of least squares — fit a straight line to scattered data by minimizing the sum of squared errors.",
        "lineage": "The mathematical foundation for all optimization-based learning; directly leads to <a href=\"/section/1#model-adaline\">Adaline</a> and modern <a href=\"/section/3#model-backprop\">Backpropagation</a>.",
        "formula": "y = wx + b &nbsp; minimize Σ(yᵢ - (wxᵢ + b))²",
        "module": "/src/demos/linearRegression-section1.js",
        "mount": "mountLinearRegression"
      },
      {
        "id": "demo-bayes",
        "anchorId": "model-bayes",
        "year": "1812",
        "name": "Bayes' Theorem",
        "paper": "https://en.wikipedia.org/wiki/Bayes%27_theorem",
        "text": "Update your belief based on new evidence. Prior × likelihood → posterior. The core framework of probabilistic inference.",
        "lineage": "The foundation of probabilistic reasoning; directly enables <a href=\"/section/2#model-naivebayes\">Naive Bayes</a> classifiers and <a href=\"/section/4#model-gmm\">GMM+EM</a> clustering.",
        "formula": "P(A|B) = P(B|A)·P(A) / P(B) nbsp; posterior = likelihood × prior / evidence",
        "module": "/src/demos/bayes-section1.js",
        "mount": "mountBayes"
      },
      {
        "id": "demo-markov",
        "anchorId": "model-markov",
        "year": "1906",
        "name": "Markov Chain",
        "paper": "https://en.wikipedia.org/wiki/Markov_chain",
        "text": "Memoryless state transitions — the next state depends only on the current state. Cornerstone of HMM, MCMC, and PageRank.",
        "lineage": "Inspires sequential modeling; its memoryless limitation motivates <a href=\"/section/3#model-rnn\">RNN</a> (which adds memory) and <a href=\"/section/3#model-boltzmann\">Boltzmann Machine</a> sampling.",
        "formula": "P(Xₙ₊₁|Xₙ,Xₙ₋₁,...) = P(Xₙ₊₁|Xₙ) nbsp; memoryless property",
        "module": "/src/demos/markov-section1.js",
        "mount": "mountMarkov"
      },
      {
        "id": "demo-mcp",
        "anchorId": "model-mcp",
        "year": "1943",
        "name": "McCulloch-Pitts Neuron",
        "paper": "https://doi.org/10.1007/BF02478259",
        "text": "The first mathematical model of a neuron — binary output controlled by excitatory (+1) and inhibitory (−1) weighted inputs against a threshold θ. Can compute AND, OR, NOT and any logical function. Precursor to every artificial neuron.",
        "lineage": "Takes <a href=\"/section/1#model-linreg\">Linear Regression</a>'s weighted sum and adds a binary threshold; Rosenblatt's <a href=\"/section/1#model-perceptron\">Perceptron</a> adds a learning rule on top, and <a href=\"/section/1#model-adaline\">Adaline</a> then replaces discrete updates with gradient descent.",
        "formula": "y = 1  if  Σᵢ wᵢxᵢ ≥ θ,  else 0   (wᵢ ∈ {+1, −1},  xᵢ ∈ {0,1})",
        "module": "/src/demos/mccullochPitts-section1.js",
        "mount": "mountMcCullochPitts"
      },
      {
        "id": "demo-shannon",
        "anchorId": "model-shannon",
        "year": "1948",
        "name": "Shannon's Information Theory",
        "paper": "https://doi.org/10.1002/j.1538-7305.1948.tb01338.x",
        "text": "Claude Shannon defined information as surprise: rare events carry more information than common ones. Entropy H = −Σ p log₂ p measures the average uncertainty in a distribution — the theoretical minimum bits needed per symbol.",
        "lineage": "Formalizes the mathematics behind <a href=\"/section/2#model-naivebayes\">Naive Bayes</a>' probabilistic reasoning; entropy directly drives Information Gain in <a href=\"/section/3#model-dtree\">Decision Trees</a> and cross-entropy loss used by every modern neural network.",
        "formula": "H(X) = −Σᵢ P(xᵢ) log₂ P(xᵢ)   (bits)   ·   H reaches maximum when all outcomes equiprobable",
        "module": "/src/demos/shannon-section1.js",
        "mount": "mountShannon"
      },
      {
        "id": "demo-perceptron",
        "anchorId": "model-perceptron",
        "year": "1958",
        "name": "Perceptron",
        "paper": "https://doi.org/10.1037/h0042519",
        "text": "Rosenblatt's first artificial neuron that could learn from data. Computes weighted sum of inputs; output 1 if above threshold, 0 otherwise.",
        "lineage": "Builds on <a href=\"/section/1#model-linreg\">Linear Regression</a> with a step activation; its linear-only limitation is fixed by <a href=\"/section/1#model-adaline\">Adaline</a> and later <a href=\"/section/3#model-backprop\">Backpropagation</a>.",
        "formula": "y = step(w·x + b) update: w += η(target - y)·x",
        "module": "/src/demos/perceptron-section1.js",
        "mount": "mountPerceptron"
      },
      {
        "id": "demo-adaline",
        "anchorId": "model-adaline",
        "year": "1960",
        "name": "Adaline",
        "paper": "https://en.wikipedia.org/wiki/ADALINE",
        "text": "Widrow & Hoff's adaptive linear neuron — unlike the Perceptron, Adaline computes error <strong>before</strong> the activation function, enabling true gradient descent (LMS rule). The decision boundary glides smoothly into place!",
        "lineage": "Improves on <a href=\"/section/1#model-perceptron\">Perceptron</a> by using continuous gradient descent instead of discrete updates; the LMS rule directly inspires <a href=\"/section/3#model-backprop\">Backpropagation</a>.",
        "formula": "z = w·x + b Δw = η(target − z)·x error on raw output, not after step()",
        "module": "/src/demos/adaline-section1.js",
        "mount": "mountAdaline"
      }
    ]
  },
  "2": {
    "id": 2,
    "era": "Section II · 1960s–1970s",
    "color": "var(--a7)",
    "progress": "linear-gradient(90deg,var(--a7),var(--a3))",
    "title": "Early Exploration & The First AI Winter",
    "desc": "k-NN, Naive Bayes, and the chain rule — simple but powerful ideas that still matter today.",
    "prev": {
      "label": "Section 1",
      "to": "/section/1"
    },
    "next": {
      "label": "Section 3",
      "to": "/section/3"
    },
    "models": [
      {
        "id": "demo-nb",
        "anchorId": "model-naivebayes",
        "year": "1960s",
        "name": "Naive Bayes Classifier",
        "paper": "https://en.wikipedia.org/wiki/Naive_Bayes_classifier",
        "text": "Assumes features are independent (they usually aren't!), yet amazingly effective for spam filtering and text classification.",
        "lineage": "Directly applies <a href=\"/section/1#model-bayes\">Bayes' Theorem</a> to classification with the \"naive\" independence assumption; probabilistic thinking later extends to <a href=\"/section/4#model-gmm\">GMM+EM</a>.",
        "formula": "P(class|features) ∝ P(class) × ∏ P(featureᵢ | class)",
        "module": "/src/demos/naiveBayes-section2.js",
        "mount": "mountNaiveBayes"
      },
      {
        "id": "demo-knn",
        "anchorId": "model-knn",
        "year": "1967",
        "name": "k-Nearest Neighbors",
        "paper": "https://doi.org/10.1109/TIT.1967.1053964",
        "text": "No training needed — classify a new point by majority vote of its k closest known samples. Simple yet surprisingly effective.",
        "lineage": "A non-parametric alternative to <a href=\"/section/1#model-perceptron\">Perceptron</a>'s linear boundary; its distance-based approach later inspires kernel methods in <a href=\"/section/4#model-svm\">SVM</a>.",
        "formula": "prediction = mode(labels of k nearest neighbors)",
        "module": "/src/demos/knn-section2.js",
        "mount": "mountKnn"
      },
      {
        "id": "demo-hmm",
        "anchorId": "model-hmm",
        "year": "1960s–70s",
        "name": "Hidden Markov Model (HMM)",
        "paper": "https://doi.org/10.1109/5.18626",
        "text": "Extend the <a href=\"/section/1#model-markov\">Markov Chain</a> with hidden states you can't observe directly — only their noisy emissions. The Viterbi algorithm decodes the most likely hidden sequence given the observations.",
        "lineage": "Applies <a href=\"/section/1#model-markov\">Markov Chain</a>'s state transitions to latent-variable modeling; dominated speech recognition for 40 years before being superseded by <a href=\"/section/4#model-lstm\">LSTM</a> and eventually <a href=\"/section/7#model-transformer\">Transformer</a>.",
        "formula": "P(X,Z) = P(z₁) ∏ₜ P(zₜ|zₜ₋₁) P(xₜ|zₜ)   ·   Viterbi: δₜ(s) = max P(z₁…zₜ₋₁,xₜ|s)",
        "module": "/src/demos/hmm-section2.js",
        "mount": "mountHmm"
      },
      {
        "id": "demo-chain",
        "anchorId": "model-chainrule",
        "year": "1970",
        "name": "Automatic Differentiation (Chain Rule)",
        "paper": "https://en.wikipedia.org/wiki/Automatic_differentiation",
        "text": "Linnainmaa's chain rule in code — compute gradients backward from output to inputs. The mathematical foundation of ALL neural network training.",
        "lineage": "Extends <a href=\"/section/1#model-adaline\">Adaline</a>'s gradient idea to arbitrary computation graphs; directly enables <a href=\"/section/3#model-backprop\">Backpropagation</a> in deep networks.",
        "formula": "∂L/∂x = (∂L/∂z) · (∂z/∂y) · (∂y/∂x) — multiply local gradients backward!",
        "module": "/src/demos/chainRule-section2.js",
        "mount": "mountChainRule"
      }
    ]
  },
  "3": {
    "id": 3,
    "era": "Section III · 1980s",
    "color": "var(--a3)",
    "progress": "linear-gradient(90deg,var(--a3),var(--a2))",
    "title": "The Revival & Classical ML",
    "desc": "Backpropagation revives neural networks. Decision trees, RNNs, and Boltzmann machines emerge.",
    "prev": {
      "label": "Section 2",
      "to": "/section/2"
    },
    "next": {
      "label": "Section 4",
      "to": "/section/4"
    },
    "models": [
      {
        "id": "demo-neo",
        "anchorId": "model-neocognitron",
        "year": "1980",
        "name": "Neocognitron",
        "paper": "https://doi.org/10.1007/BF00344251",
        "text": "Fukushima's hierarchical pattern recognizer — inspired by the visual cortex. Simple cells detect local features, complex cells pool them for translation invariance.",
        "lineage": "Extends <a href=\"/section/1#model-perceptron\">Perceptron</a> into a hierarchical architecture; the direct ancestor of <a href=\"/section/4#model-cnn\">CNN/LeNet</a> (adds backprop-based training).",
        "formula": "S-cells (feature detect) → C-cells (pool/invariance) → deeper layers → recognition",
        "module": "/src/demos/neocognitron-section3.js",
        "mount": "mountNeocognitron"
      },
      {
        "id": "demo-hopfield",
        "anchorId": "model-hopfield",
        "year": "1982",
        "name": "Hopfield Network",
        "paper": "https://doi.org/10.1073/pnas.79.8.2554",
        "text": "Hopfield's associative memory — a network of binary neurons that stores patterns as energy minima. Corrupt a stored pattern with noise, then let neurons flip one-by-one to descend the energy landscape until the original is recalled.",
        "lineage": "Inspires energy-based thinking that flows into <a href=\"/section/3#model-boltzmann\">Boltzmann Machine</a> (stochastic version) and, decades later, Transformer's attention mechanism (formal equivalence proven in 2020). 2024 Nobel Prize in Physics.",
        "formula": "W = (1/N) Σₖ ξₖ ξₖᵀ   →   sᵢ ← sign(Σⱼ Wᵢⱼ sⱼ)   →   E = −½ sᵀWs (decreases monotonically)",
        "module": "/src/demos/hopfield-section3.js",
        "mount": "mountHopfield"
      },
      {
        "id": "demo-boltz",
        "anchorId": "model-boltzmann",
        "year": "1985",
        "name": "Boltzmann Machine",
        "paper": "https://doi.org/10.1016/S0364-0213(85)80012-4",
        "text": "Hinton & Sejnowski's stochastic network — neurons randomly flip on/off based on their energy. Lower energy states are more likely.",
        "lineage": "Introduces energy-based probabilistic learning inspired by <a href=\"/section/1#model-markov\">Markov Chain</a> sampling; its restricted variant directly leads to <a href=\"/section/5#model-dbn\">DBN</a> pretraining.",
        "formula": "P(state) ∝ e^(-Energy/T) — lower energy = more probable. Energy = -Σ wᵢⱼ sᵢ sⱼ",
        "module": "/src/demos/boltzmann-section3.js",
        "mount": "mountBoltzmann"
      },
      {
        "id": "demo-rnn",
        "anchorId": "model-rnn",
        "year": "1986",
        "name": "RNN (Recurrent Neural Network)",
        "paper": "https://doi.org/10.1038/323533a0",
        "text": "Networks with loops — the hidden state acts as memory, carrying information from previous time steps. Essential for sequences like text, speech, and time series.",
        "lineage": "Overcomes <a href=\"/section/1#model-markov\">Markov Chain</a>'s memoryless limitation by adding recurrence; its vanishing gradient problem is solved by <a href=\"/section/4#model-lstm\">LSTM</a>.",
        "formula": "hₜ = tanh(W_h · hₜ₋₁ + W_x · xₜ + b) — hidden state = f(previous state + current input)",
        "module": "/src/demos/rnn-section3.js",
        "mount": "mountRnn"
      },
      {
        "id": "demo-bp",
        "anchorId": "model-backprop",
        "year": "1986",
        "name": "Backpropagation",
        "paper": "https://doi.org/10.1038/323533a0",
        "text": "Rumelhart, Hinton & Williams made neural networks trainable. Compute the error at the output, then propagate gradients backward through each layer.",
        "lineage": "Applies the <a href=\"/section/2#model-chainrule\">Chain Rule</a> to multi-layer networks, solving <a href=\"/section/1#model-perceptron\">Perceptron</a>'s XOR problem; enables ALL deep learning from <a href=\"/section/4#model-cnn\">CNN</a> to <a href=\"/section/7#model-transformer\">Transformer</a>.",
        "formula": "∂Loss/∂wᵢ = ∂Loss/∂output · ∂output/∂hidden · ∂hidden/∂wᵢ — chain rule through layers",
        "module": "/src/demos/backpropagation-section3.js",
        "mount": "mountBackpropagation"
      },
      {
        "id": "demo-tree",
        "anchorId": "model-dtree",
        "year": "1986",
        "name": "Decision Tree",
        "paper": "https://link.springer.com/article/10.1007/BF00116251",
        "text": "Quinlan's ID3 algorithm — recursively split data on the feature that gives the most information gain. Simple, fast, and explainable.",
        "lineage": "A non-neural alternative to <a href=\"/section/1#model-perceptron\">Perceptron</a>; later ensembled into <a href=\"/section/4#model-randomforest\">Random Forest</a>, <a href=\"/section/5#model-gbdt\">GBDT</a>, and <a href=\"/section/7#model-xgboost\">XGBoost</a>.",
        "formula": "Split on feature with max Information Gain = H(parent) - Σ (|child|/|parent|) H(child)",
        "module": "/src/demos/decisionTree-section3.js",
        "mount": "mountDecisionTree"
      },
      {
        "id": "demo-qlearning",
        "anchorId": "model-qlearning",
        "year": "1989",
        "name": "Q-Learning",
        "paper": "https://doi.org/10.1007/BF00992698",
        "text": "Watkins' model-free reinforcement learning: an agent explores a grid world, collects rewards, and updates a table of action-values Q(s,a). No environment model needed — pure trial-and-error with a Bellman update rule.",
        "lineage": "Foundational RL algorithm that directly enables <a href=\"/section/6#model-dqn\">DQN</a> (replaces the Q-table with a deep network); the policy-optimization lineage leads through PPO to <a href=\"/section/8#model-chatgpt\">ChatGPT</a>'s RLHF training.",
        "formula": "Q(s,a) ← Q(s,a) + α [ r + γ·max_a' Q(s',a') − Q(s,a) ]   (off-policy Bellman update)",
        "module": "/src/demos/qlearning-section3.js",
        "mount": "mountQLearning"
      }
    ]
  },
  "4": {
    "id": 4,
    "era": "Section IV · 1990s–2001",
    "color": "var(--a2)",
    "progress": "linear-gradient(90deg,var(--a2),var(--a6))",
    "title": "The Golden Age of Statistical Learning",
    "desc": "SVM, LSTM, Random Forest — the classics that powered ML before deep learning took over.",
    "prev": {
      "label": "Section 3",
      "to": "/section/3"
    },
    "next": {
      "label": "Section 5",
      "to": "/section/5"
    },
    "models": [
      {
        "id": "demo-pca",
        "anchorId": "model-pca",
        "year": "1901",
        "name": "PCA (Principal Component Analysis)",
        "paper": "https://doi.org/10.1080/14786440109462720",
        "text": "Pearson's dimensionality reduction: find the orthogonal directions of maximum variance in data. Project onto the top-k eigenvectors of the covariance matrix to discard noise while preserving structure.",
        "lineage": "The canonical linear embedding technique; its latent-space concept directly inspires <a href=\"/section/5#model-sparse-ae\">Sparse Autoencoder</a>, <a href=\"/section/6#model-vae\">VAE</a>, and every modern representation-learning method.",
        "formula": "Cov = XᵀX/n   →   eigendecomposition   →   PC1 = argmax‖w‖=1 wᵀCovw   (max variance direction)",
        "module": "/src/demos/pca-section4.js",
        "mount": "mountPca"
      },
      {
        "id": "demo-gmm",
        "anchorId": "model-gmm",
        "year": "1977",
        "name": "GMM + EM Algorithm",
        "paper": "https://doi.org/10.1111/j.2517-6161.1977.tb01600.x",
        "text": "Fit a mixture of Gaussians to data using Expectation-Maximization. E-step: soft cluster assignment. M-step: update parameters. Iterate until convergence.",
        "lineage": "Applies <a href=\"/section/1#model-bayes\">Bayes' Theorem</a> to unsupervised clustering with latent variables; EM's iterative approach later inspires <a href=\"/section/6#model-vae\">VAE</a>'s variational inference.",
        "formula": "E: P(k|xᵢ) = πₖN(xᵢ|μₖ,σₖ) / Σⱼ πⱼN(xᵢ|μⱼ,σⱼ) M: update μ,σ,π",
        "module": "/src/demos/gmm-section4.js",
        "mount": "mountGmm"
      },
      {
        "id": "demo-svm",
        "anchorId": "model-svm",
        "year": "1995",
        "name": "SVM (Support Vector Machine)",
        "paper": "https://doi.org/10.1007/BF00994018",
        "text": "Vapnik's maximum-margin classifier — find the hyperplane that separates classes with the widest possible margin. Support vectors define the boundary.",
        "lineage": "Extends <a href=\"/section/2#model-knn\">k-NN</a>'s distance-based idea with kernel tricks for non-linear boundaries; dominated ML before <a href=\"/section/6#model-alexnet\">AlexNet</a> proved deep learning superior.",
        "formula": "maximize margin = 2/||w|| subject to yᵢ(w·xᵢ + b) ≥ 1",
        "module": "/src/demos/svm-section4.js",
        "mount": "mountSvm"
      },
      {
        "id": "demo-lstm",
        "anchorId": "model-lstm",
        "year": "1997",
        "name": "LSTM (Long Short-Term Memory)",
        "paper": "https://doi.org/10.1162/neco.1997.9.8.1735",
        "text": "Hochreiter & Schmidhuber's solution to vanishing gradients. Three gates (forget, input, output) control what to remember, add, and output from the cell state.",
        "lineage": "Solves <a href=\"/section/3#model-rnn\">RNN</a>'s vanishing gradient problem with gated memory; enables <a href=\"/section/6#model-seq2seq\">Seq2Seq</a> translation and <a href=\"/section/7#model-elmo\">ELMo</a> embeddings.",
        "formula": "fₜ = σ(forget) iₜ = σ(input) oₜ = σ(output) cₜ = fₜ⊙cₜ₋₁ + iₜ⊙tanh(…)",
        "module": "/src/demos/lstm-section4.js",
        "mount": "mountLstm"
      },
      {
        "id": "demo-ada",
        "anchorId": "model-adaboost",
        "year": "1997",
        "name": "AdaBoost",
        "paper": "https://doi.org/10.1006/jcss.1997.1504",
        "text": "Freund & Schapire's adaptive boosting — train weak classifiers sequentially, each focusing on mistakes of previous ones by upweighting misclassified samples.",
        "lineage": "Introduces sequential boosting of <a href=\"/section/3#model-dtree\">Decision Tree</a> stumps; directly inspires <a href=\"/section/5#model-gbdt\">GBDT</a> (gradient-based boosting) and <a href=\"/section/7#model-xgboost\">XGBoost</a>.",
        "formula": "H(x) = sign(Σ αₜhₜ(x)) where αₜ = ½ ln((1-εₜ)/εₜ) — weight by accuracy",
        "module": "/src/demos/adaBoost-section4.js",
        "mount": "mountAda"
      },
      {
        "id": "demo-cnn",
        "anchorId": "model-cnn",
        "year": "1998",
        "name": "CNN / LeNet",
        "paper": "http://yann.lecun.com/exdb/lenet/",
        "text": "LeCun's convolutional neural network for handwritten digit recognition. Convolution filters slide over the image to extract features, then pooling shrinks them.",
        "lineage": "Adds <a href=\"/section/3#model-backprop\">Backpropagation</a> training to <a href=\"/section/3#model-neocognitron\">Neocognitron</a>'s hierarchical design; directly leads to <a href=\"/section/6#model-alexnet\">AlexNet</a> and <a href=\"/section/6#model-resnet\">ResNet</a>.",
        "formula": "Input → [Conv → ReLU → Pool] × N → Flatten → Dense → Output class",
        "module": "/src/demos/cnn-section4.js",
        "mount": "mountCnn"
      },
      {
        "id": "demo-rf",
        "anchorId": "model-randomforest",
        "year": "2001",
        "name": "Random Forest",
        "paper": "https://doi.org/10.1023/A:1010933404324",
        "text": "Breiman's ensemble of decision trees — each tree trained on a random subset of data and features. Final prediction by majority vote.",
        "lineage": "Ensembles many <a href=\"/section/3#model-dtree\">Decision Trees</a> via bagging to reduce overfitting; the ensemble idea is refined by <a href=\"/section/5#model-gbdt\">GBDT</a> and <a href=\"/section/7#model-xgboost\">XGBoost</a> using boosting instead.",
        "formula": "prediction = mode(tree₁(x), tree₂(x), ..., treeₙ(x)) — majority vote of random trees",
        "module": "/src/demos/randomForest-section4.js",
        "mount": "mountRf"
      }
    ]
  },
  "5": {
    "id": 5,
    "era": "Section V · 2000s",
    "color": "var(--a4)",
    "progress": "linear-gradient(90deg,var(--a4),var(--a5))",
    "title": "The Eve of Deep Learning",
    "desc": "Deep belief nets, autoencoders, gradient boosting, and neural language models set the stage for the deep learning revolution.",
    "prev": {
      "label": "Section 4",
      "to": "/section/4"
    },
    "next": {
      "label": "Section 6",
      "to": "/section/6"
    },
    "models": [
      {
        "id": "demo-gbdt",
        "anchorId": "model-gbdt",
        "year": "2001",
        "name": "GBDT (Gradient Boosted Decision Trees)",
        "paper": "https://doi.org/10.1214/aos/1013203451",
        "text": "Friedman's gradient boosting — each new tree fits the RESIDUAL errors of the previous ensemble. Sequentially reduces loss by correcting current mistakes.",
        "lineage": "Replaces <a href=\"/section/4#model-adaboost\">AdaBoost</a>'s sample reweighting with gradient-based residual fitting on <a href=\"/section/3#model-dtree\">Decision Trees</a>; optimized into <a href=\"/section/7#model-xgboost\">XGBoost</a>.",
        "formula": "F_m(x) = F_{m-1}(x) + η · h_m(x) where h_m fits the residuals r = y - F_{m-1}(x)",
        "module": "/src/demos/gbdt-section5.js",
        "mount": "mountGbdt"
      },
      {
        "id": "demo-nnlm",
        "anchorId": "model-nnlm",
        "year": "2003",
        "name": "NNLM (Neural Network Language Model)",
        "paper": "https://jmlr.org/papers/v3/bengio03a.html",
        "text": "Bengio's breakthrough — predict the next word using a neural network over word embeddings. Each word gets a learned vector representation.",
        "lineage": "First neural approach to language modeling using <a href=\"/section/3#model-backprop\">Backpropagation</a>; its word embeddings lead to <a href=\"/section/6#model-word2vec\">Word2Vec</a> and its next-word prediction paradigm leads to <a href=\"/section/7#model-gpt1\">GPT</a>.",
        "formula": "P(wₜ | wₜ₋₁, wₜ₋₂, ...) = softmax(W · tanh(C · [e(wₜ₋₁); e(wₜ₋₂); ...]))",
        "module": "/src/demos/nnlm-section5.js",
        "mount": "mountNnlm"
      },
      {
        "id": "demo-dbn",
        "anchorId": "model-dbn",
        "year": "2006",
        "name": "Deep Belief Network (DBN)",
        "paper": "https://doi.org/10.1162/neco.2006.18.7.1527",
        "text": "Hinton's breakthrough — train deep networks by stacking Restricted Boltzmann Machines one layer at a time. Each layer learns increasingly abstract features.",
        "lineage": "Stacks <a href=\"/section/3#model-boltzmann\">Boltzmann Machine</a> layers with greedy pretraining; this first successful deep network paves the way for <a href=\"/section/6#model-alexnet\">AlexNet</a> and all modern deep learning.",
        "formula": "Layer 1: learn edges → Layer 2: learn shapes → Layer 3: learn objects (greedy pretraining)",
        "module": "/src/demos/dbn-section5.js",
        "mount": "mountDbn"
      },
      {
        "id": "demo-sae",
        "anchorId": "model-sparse-ae",
        "year": "2006",
        "name": "Sparse Autoencoder",
        "paper": "https://arxiv.org/abs/1312.5663",
        "text": "Compress data through a bottleneck, then reconstruct it. Sparsity constraint ensures only a few neurons activate — forcing efficient, meaningful features.",
        "lineage": "Learns compressed representations like <a href=\"/section/5#model-dbn\">DBN</a> but via reconstruction loss; its encode-decode structure directly leads to <a href=\"/section/6#model-vae\">VAE</a> (adds probabilistic sampling).",
        "formula": "Input → Encoder (compress) → Bottleneck (sparse code) → Decoder (reconstruct) → Output ≈ Input",
        "module": "/src/demos/sparseAutoencoder-section5.js",
        "mount": "mountSae"
      },
      {
        "id": "demo-rbm",
        "anchorId": "model-rbm",
        "year": "2006",
        "name": "Restricted Boltzmann Machine (RBM)",
        "paper": "https://doi.org/10.1162/neco.2006.18.7.1527",
        "text": "Hinton's two-layer energy-based model: visible units at the bottom, hidden units on top, with no within-layer connections. Trained by Contrastive Divergence (CD-k): clamp real data, forward-pass, reconstruct, update weights to pull down energy on data and push it up on reconstructions.",
        "lineage": "The direct building block stacked to form <a href=\"/section/5#model-dbn\">DBN</a> layers; its bidirectional generative structure leads to <a href=\"/section/6#model-vae\">VAE</a>, while Contrastive Divergence prefigures modern noise-contrastive estimation.",
        "formula": "E(v,h)= −bᵀv − cᵀh − vᵀWh   ·   P(hⱼ=1|v)= σ(cⱼ+Wⱼv)   ·   ΔW≈⟨vh⟩_data−⟨vh⟩_recon",
        "module": "/src/demos/rbm-section5.js",
        "mount": "mountRbm"
      },
      {
        "id": "demo-dae",
        "anchorId": "model-dae",
        "year": "2008",
        "name": "Denoising Autoencoder",
        "paper": "https://doi.org/10.1145/1390156.1390294",
        "text": "Corrupt the input with noise, then train the network to reconstruct the CLEAN original. Forces robust features that capture true data structure.",
        "lineage": "Extends <a href=\"/section/5#model-sparse-ae\">Sparse Autoencoder</a> with noise-based regularization; the \"denoise to learn\" principle directly inspires <a href=\"/section/8#model-diffusion\">Diffusion Models</a>.",
        "formula": "Clean x → Add noise → x̃ → Encoder → Decoder → x̂ ≈ x (not x̃!) — learn to denoise",
        "module": "/src/demos/denoisingAutoencoder-section5.js",
        "mount": "mountDae"
      },
      {
        "id": "demo-tsne",
        "anchorId": "model-tsne",
        "year": "2008",
        "name": "t-SNE (t-distributed Stochastic Neighbor Embedding)",
        "paper": "https://jmlr.org/papers/v9/vandermaaten08a.html",
        "text": "van der Maaten & Hinton's non-linear dimensionality reduction: model pairwise similarities in high-dim as Gaussians (P_ij) and in 2D as Student-t distributions (Q_ij). Minimize KL(P‖Q) by gradient descent — nearby clusters snap together, distant ones push apart.",
        "lineage": "Extends <a href=\"/section/4#model-pca\">PCA</a>'s linear projection to non-linear manifolds; uses the heavy-tailed t-distribution (vs Gaussian) to solve the crowding problem; standard tool for visualizing <a href=\"/section/6#model-word2vec\">Word2Vec</a> and transformer embeddings.",
        "formula": "Q_ij = (1+‖yᵢ−yⱼ‖²)⁻¹ / Z   ·   ∂C/∂yᵢ = 4Σⱼ(Pᵢⱼ−Qᵢⱼ)(yᵢ−yⱼ)(1+‖yᵢ−yⱼ‖²)⁻¹",
        "module": "/src/demos/tsne-section5.js",
        "mount": "mountTsne"
      }
    ]
  },
  "6": {
    "id": 6,
    "era": "Section VI · 2012–2015",
    "color": "var(--a5)",
    "progress": "linear-gradient(90deg,var(--a5),var(--a6))",
    "title": "The Deep Learning Explosion",
    "desc": "AlexNet triggers the revolution. GANs, attention, ResNets, and Word2Vec reshape AI forever.",
    "prev": {
      "label": "Section 5",
      "to": "/section/5"
    },
    "next": {
      "label": "Section 7",
      "to": "/section/7"
    },
    "models": [
      {
        "id": "demo-alex",
        "anchorId": "model-alexnet",
        "year": "2012",
        "name": "AlexNet",
        "paper": "https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html",
        "text": "Krizhevsky's CNN crushed ImageNet by 10%. Deeper than LeNet with ReLU, dropout, and GPU training. Proved deep learning works at scale.",
        "lineage": "Scales <a href=\"/section/4#model-cnn\">CNN/LeNet</a> with <a href=\"/section/6#model-dropout\">Dropout</a> and GPU power; its ImageNet victory ignites the deep learning era leading to <a href=\"/section/6#model-resnet\">ResNet</a> and <a href=\"/section/8#model-vit\">ViT</a>.",
        "formula": "227×227 → Conv(96) → Pool → Conv(256) → Pool → Conv(384) → Conv(384) → Conv(256) → FC → 1000 classes",
        "module": "/src/demos/alexNet-section6.js",
        "mount": "mountAlex"
      },
      {
        "id": "demo-w2v",
        "anchorId": "model-word2vec",
        "year": "2013",
        "name": "Word2Vec",
        "paper": "https://arxiv.org/abs/1301.3781",
        "text": "Mikolov's word embeddings — learn vector representations where semantic relationships become arithmetic: King − Man + Woman ≈ Queen.",
        "lineage": "Simplifies <a href=\"/section/5#model-nnlm\">NNLM</a> into efficient embedding training; its dense vectors become the input layer for <a href=\"/section/7#model-elmo\">ELMo</a>, <a href=\"/section/7#model-bert\">BERT</a>, and all modern NLP.",
        "formula": "king − man + woman ≈ queen — semantic arithmetic in vector space!",
        "module": "/src/demos/word2vec-section6.js",
        "mount": "mountW2v"
      },
      {
        "id": "demo-vae",
        "anchorId": "model-vae",
        "year": "2013",
        "name": "VAE (Variational Autoencoder)",
        "paper": "https://arxiv.org/abs/1312.6114",
        "text": "Kingma's generative model — encode data into a smooth latent distribution, sample, and decode. The latent space is continuous and interpolatable.",
        "lineage": "Adds probabilistic sampling to <a href=\"/section/5#model-sparse-ae\">Sparse Autoencoder</a> using <a href=\"/section/4#model-gmm\">GMM+EM</a>'s variational ideas; its latent space concept flows into <a href=\"/section/8#model-diffusion\">Diffusion Models</a>.",
        "formula": "Encode: x → (μ, σ²) → sample z ~ N(μ,σ²) → Decode: z → x̂ — smooth generative latent space",
        "module": "/src/demos/vae-section6.js",
        "mount": "mountVae"
      },
      {
        "id": "demo-dqn",
        "anchorId": "model-dqn",
        "year": "2013",
        "name": "DQN (Deep Q-Network)",
        "paper": "https://arxiv.org/abs/1312.5602",
        "text": "DeepMind's breakthrough combining Q-Learning with a deep neural network — plus experience replay and target networks — to master Atari games from raw pixels with no domain-specific knowledge.",
        "lineage": "Merges <a href=\"/section/3#model-qlearning\">Q-Learning</a>'s temporal-difference updates with <a href=\"/section/6#model-alexnet\">AlexNet</a>'s deep CNN; experience replay pioneered the off-policy training paradigm used in <a href=\"/section/8#model-chatgpt\">RLHF</a> and modern RL.",
        "formula": "Q(s,a) ← Q(s,a) + α[r + γ·max_a' Q_target(s',a') − Q(s,a)] + replay buffer",
        "module": "/src/demos/dqn-section6.js",
        "mount": "mountDqn"
      },
      {
        "id": "demo-vggnet",
        "anchorId": "model-vggnet",
        "year": "2014",
        "name": "VGGNet",
        "paper": "https://arxiv.org/abs/1409.1556",
        "text": "Simonyan & Zisserman's elegantly simple insight: replace large kernels (7×7, 11×11) with stacks of tiny 3×3 convolutions. Two 3×3 layers = 5×5 effective receptive field but fewer parameters and an extra non-linearity. Won ILSVRC 2014 localisation.",
        "lineage": "Deepens <a href=\"/section/4#model-cnn\">CNN/LeNet</a> and <a href=\"/section/6#model-alexnet\">AlexNet</a> by replacing big kernels with depth; its 'only 3×3' philosophy directly inspires <a href=\"/section/6#model-resnet\">ResNet</a>'s building blocks and modern efficient architectures.",
        "formula": "2×(3×3) = 5×5 RF,  18C² params vs 25C²   ·   3×(3×3) = 7×7 RF,  27C² vs 49C²",
        "module": "/src/demos/vggnet-section6.js",
        "mount": "mountVggnet"
      },
      {
        "id": "demo-inception",
        "anchorId": "model-inception",
        "year": "2014",
        "name": "Inception / GoogLeNet",
        "paper": "https://arxiv.org/abs/1409.4842",
        "text": "Szegedy's Inception module runs four parallel branches on the same input: 1×1, 3×3, 5×5 convolutions and a max-pool, then concatenates their outputs. Captures features at multiple scales simultaneously. 22 layers deep, yet only 4M parameters vs VGG's 138M.",
        "lineage": "Rivals <a href=\"/section/6#model-vggnet\">VGGNet</a> at ILSVRC 2014 with far fewer parameters; the 1×1 bottleneck idea directly inspires <a href=\"/section/6#model-resnet\">ResNet</a>'s bottleneck blocks and modern efficient architectures.",
        "formula": "Output = Concat[ Conv1×1(x), Conv3×3(x), Conv5×5(x), MaxPool(x) ]   (all at same spatial size)",
        "module": "/src/demos/inception-section6.js",
        "mount": "mountInception"
      },
      {
        "id": "demo-drop",
        "anchorId": "model-dropout",
        "year": "2014",
        "name": "Dropout",
        "paper": "https://jmlr.org/papers/v15/srivastava14a.html",
        "text": "Randomly \"kill\" neurons during training. Forces the network to not rely on any single neuron — like training an ensemble of sub-networks.",
        "lineage": "Key regularization technique first used in <a href=\"/section/6#model-alexnet\">AlexNet</a>; prevents overfitting in all deep networks from <a href=\"/section/6#model-resnet\">ResNet</a> to <a href=\"/section/7#model-transformer\">Transformer</a>.",
        "formula": "During training: hᵢ = hᵢ × Bernoulli(p) — each neuron dropped with probability (1-p)",
        "module": "/src/demos/dropout-section6.js",
        "mount": "mountDrop"
      },
      {
        "id": "demo-gan",
        "anchorId": "model-gan",
        "year": "2014",
        "name": "GAN (Generative Adversarial Network)",
        "paper": "https://arxiv.org/abs/1406.2661",
        "text": "Goodfellow's brilliant idea — two networks competing: Generator creates fakes, Discriminator judges real vs fake. They push each other to improve.",
        "lineage": "A new generative paradigm rivaling <a href=\"/section/6#model-vae\">VAE</a>; leads to <a href=\"/section/7#model-stylegan\">StyleGAN</a> for photorealistic faces, later surpassed by <a href=\"/section/8#model-diffusion\">Diffusion Models</a>.",
        "formula": "min_G max_D [E log D(x) + E log(1-D(G(z)))] — Generator vs Discriminator game",
        "module": "/src/demos/gan-section6.js",
        "mount": "mountGan"
      },
      {
        "id": "demo-attn",
        "anchorId": "model-seq2seq",
        "year": "2014",
        "name": "Seq2Seq + Attention",
        "paper": "https://arxiv.org/abs/1409.0473",
        "text": "Bahdanau's attention mechanism — let the decoder LOOK BACK at relevant input parts at each step. Revolutionary for translation.",
        "lineage": "Extends <a href=\"/section/4#model-lstm\">LSTM</a> encoder-decoder with attention; this attention idea is generalized into the pure-attention <a href=\"/section/7#model-transformer\">Transformer</a>.",
        "formula": "attention(Q,K) = softmax(Q·Kᵀ) · V — focus on relevant input words for each output word",
        "module": "/src/demos/seq2seqAttention-section6.js",
        "mount": "mountAttn"
      },
      {
        "id": "demo-resnet",
        "anchorId": "model-resnet",
        "year": "2015",
        "name": "ResNet (Residual Network)",
        "paper": "https://arxiv.org/abs/1512.03385",
        "text": "He's skip connections — learn the residual F(x) = H(x) − x. Output = F(x) + x. Lets gradients flow through shortcuts, enabling 152+ layers.",
        "lineage": "Solves the depth problem of <a href=\"/section/6#model-alexnet\">AlexNet</a> with skip connections; its residual design is adopted by <a href=\"/section/7#model-transformer\">Transformer</a> and <a href=\"/section/8#model-vit\">ViT</a>.",
        "formula": "output = F(x) + x — skip connection lets gradient flow through identity shortcut",
        "module": "/src/demos/resNet-section6.js",
        "mount": "mountResnet"
      },
      {
        "id": "demo-bn",
        "anchorId": "model-batchnorm",
        "year": "2015",
        "name": "Batch Normalization",
        "paper": "https://arxiv.org/abs/1502.03167",
        "text": "Ioffe & Szegedy — normalize each layer's inputs to zero mean and unit variance. Speeds up training and allows higher learning rates.",
        "lineage": "Stabilizes deep network training for <a href=\"/section/6#model-resnet\">ResNet</a> and beyond; adapted as LayerNorm in <a href=\"/section/7#model-transformer\">Transformer</a> and all modern architectures.",
        "formula": "x̂ = (x − μ_batch) / √(σ²_batch + ε) · γ + β — normalize, then scale and shift (learnable)",
        "module": "/src/demos/batchNorm-section6.js",
        "mount": "mountBn"
      },
      {
        "id": "demo-unet",
        "anchorId": "model-unet",
        "year": "2015",
        "name": "U-Net",
        "paper": "https://arxiv.org/abs/1505.04597",
        "text": "Ronneberger's encoder-decoder network for biomedical image segmentation — skip connections copy feature maps from encoder to decoder, preserving fine-grained spatial detail that downsampling would otherwise lose.",
        "lineage": "Extends autoencoder with skip connections (like <a href=\"/section/6#model-resnet\">ResNet</a>'s shortcuts) for dense prediction; its encoder-decoder + skip architecture is the backbone of <a href=\"/section/8#model-diffusion\">Diffusion Models</a>' U-Net denoiser.",
        "formula": "skip: enc_out → concat → dec_in — skip connection preserves spatial detail across resolution levels",
        "module": "/src/demos/unet-section6.js",
        "mount": "mountUnet"
      }
    ]
  },
  "7": {
    "id": 7,
    "era": "Section VII · 2016–2019",
    "color": "var(--a7)",
    "progress": "linear-gradient(90deg,var(--a7),var(--a6))",
    "title": "The Transformer Revolution",
    "desc": "Self-attention, BERT, GPT — the architecture that changed everything. Language models become the new foundation of AI.",
    "prev": {
      "label": "Section 6",
      "to": "/section/6"
    },
    "next": {
      "label": "Section 8",
      "to": "/section/8"
    },
    "models": [
      {
        "id": "demo-xgb",
        "anchorId": "model-xgboost",
        "year": "2016",
        "name": "XGBoost",
        "paper": "https://arxiv.org/abs/1603.02754",
        "text": "Chen & Guestrin's extreme gradient boosting — GBDT on steroids with regularization, column subsampling, and parallel construction. Dominated Kaggle for years.",
        "lineage": "Optimizes <a href=\"/section/5#model-gbdt\">GBDT</a> with L1/L2 regularization on <a href=\"/section/3#model-dtree\">Decision Tree</a> leaves; still the top choice for structured/tabular data even in the deep learning era.",
        "formula": "obj = Σ loss(yᵢ, ŷᵢ) + Σ Ω(tree) — loss + regularization (prevents overfitting!)",
        "module": "/src/demos/xgboost-section7.js",
        "mount": "mountXgb"
      },
      {
        "id": "demo-wave",
        "anchorId": "model-wavenet",
        "year": "2016",
        "name": "WaveNet",
        "paper": "https://arxiv.org/abs/1609.03499",
        "text": "DeepMind's autoregressive audio model — generates speech sample by sample using dilated causal convolutions to capture long-range patterns.",
        "lineage": "Applies <a href=\"/section/4#model-cnn\">CNN</a>'s convolutions to sequential audio generation; its autoregressive approach parallels <a href=\"/section/7#model-gpt1\">GPT</a>'s left-to-right text generation.",
        "formula": "P(x) = ∏ P(xₜ | x₁,...,xₜ₋₁) — predict each sample from all previous (causal)",
        "module": "/src/demos/waveNet-section7.js",
        "mount": "mountWave"
      },
      {
        "id": "demo-alphago",
        "anchorId": "model-alphago",
        "year": "2016",
        "name": "AlphaGo",
        "paper": "https://www.nature.com/articles/nature16961",
        "text": "DeepMind's Go-playing system combining deep convolutional policy and value networks with Monte Carlo Tree Search. Defeated 9-dan world champion Lee Sedol 4-1 — long thought impossible for AI.",
        "lineage": "Combines deep <a href=\"/section/4#model-cnn\">CNN</a>'s pattern recognition with <a href=\"/section/3#model-qlearning\">Q-Learning</a>'s value estimation and tree search; evolved into AlphaZero (chess, Go, shogi from scratch) then <a href=\"/section/8#model-alphafold\">AlphaFold</a>.",
        "formula": "a* = argmax[ Q(s,a) + u(s,a) ]   u(s,a) = c·P(s,a)·√N(s) / (1+N(s,a))   (PUCT)",
        "module": "/src/demos/alphaGo-section7.js",
        "mount": "mountAlphaGo"
      },
      {
        "id": "demo-yolo",
        "anchorId": "model-yolo",
        "year": "2016",
        "name": "YOLO (You Only Look Once)",
        "paper": "https://arxiv.org/abs/1506.02640",
        "text": "Redmon's real-time object detector that unifies bounding-box regression and classification into a single CNN forward pass — unlike two-stage detectors (R-CNN). Processes images at 45 fps on a GPU.",
        "lineage": "Unifies the two-stage <a href=\"/section/4#model-cnn\">CNN</a> detection pipeline into a single regression; its grid-cell approach inspired SSD, RetinaNet, and all modern single-stage detectors used today.",
        "formula": "S×S grid → each cell predicts B boxes (x,y,w,h,conf) + C class probs — all in one forward pass",
        "module": "/src/demos/yolo-section7.js",
        "mount": "mountYolo"
      },
      {
        "id": "demo-transformer",
        "anchorId": "model-transformer",
        "year": "2017",
        "name": "Transformer",
        "paper": "https://arxiv.org/abs/1706.03762",
        "text": "\"Attention Is All You Need\" — replace RNNs entirely with self-attention. Each token attends to ALL others in parallel. Multi-head attention captures different relationships.",
        "lineage": "Generalizes <a href=\"/section/6#model-seq2seq\">Seq2Seq</a>'s attention into a pure-attention architecture with <a href=\"/section/6#model-resnet\">ResNet</a>'s skip connections; becomes the backbone of <a href=\"/section/7#model-gpt1\">GPT</a>, <a href=\"/section/7#model-bert\">BERT</a>, <a href=\"/section/8#model-vit\">ViT</a>, and virtually all modern AI.",
        "formula": "Attention(Q,K,V) = softmax(QKᵀ/√d) · V — every token looks at every other token",
        "module": "/src/demos/transformer-section7.js",
        "mount": "mountTransformer"
      },
      {
        "id": "demo-ppo",
        "anchorId": "model-ppo",
        "year": "2017",
        "name": "PPO (Proximal Policy Optimization)",
        "paper": "https://arxiv.org/abs/1707.06347",
        "text": "Schulman's practical policy gradient algorithm — clips the update ratio r(θ) to [1-ε, 1+ε] to prevent catastrophic policy updates. Simple to implement and reliable across environments.",
        "lineage": "Simplifies TRPO's trust-region constraint into a clipped objective; became the default RL backbone and the <a href=\"/section/8#model-chatgpt\">RLHF</a> optimizer for ChatGPT, Claude, and almost every RLHF-tuned LLM.",
        "formula": "L_CLIP(θ) = E[ min( r_t(θ)·Â_t,  clip(r_t(θ), 1±ε)·Â_t ) ]  where r_t = π_θ/π_θ_old",
        "module": "/src/demos/ppo-section7.js",
        "mount": "mountPpo"
      },
      {
        "id": "demo-elmo",
        "anchorId": "model-elmo",
        "year": "2018",
        "name": "ELMo",
        "paper": "https://arxiv.org/abs/1802.05365",
        "text": "Embeddings from Language Models — word vectors that change based on context! \"bank\" gets different embeddings in \"river bank\" vs \"bank account\".",
        "lineage": "Makes <a href=\"/section/6#model-word2vec\">Word2Vec</a> context-aware using bidirectional <a href=\"/section/4#model-lstm\">LSTM</a>; superseded by <a href=\"/section/7#model-bert\">BERT</a>'s Transformer-based contextual embeddings.",
        "formula": "ELMo(word) = γ(s₀·e + s₁·h_forward + s₂·h_backward) — context-dependent embedding",
        "module": "/src/demos/elmo-section7.js",
        "mount": "mountElmo"
      },
      {
        "id": "demo-gpt1",
        "anchorId": "model-gpt1",
        "year": "2018",
        "name": "GPT-1",
        "paper": "https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf",
        "text": "OpenAI's first Generative Pre-trained Transformer — pretrain on massive text with next-word prediction, then fine-tune for tasks. Proved unsupervised pretraining works.",
        "lineage": "Applies <a href=\"/section/7#model-transformer\">Transformer</a> decoder to <a href=\"/section/5#model-nnlm\">NNLM</a>'s next-word prediction paradigm; scales up to <a href=\"/section/7#model-gpt2\">GPT-2</a> and ultimately <a href=\"/section/8#model-gpt3\">GPT-3</a>/<a href=\"/section/8#model-chatgpt\">ChatGPT</a>.",
        "formula": "P(wₜ | w₁...wₜ₋₁) via 12-layer Transformer decoder — left-to-right generation",
        "module": "/src/demos/gpt1-section7.js",
        "mount": "mountGpt1"
      },
      {
        "id": "demo-bert",
        "anchorId": "model-bert",
        "year": "2018",
        "name": "BERT",
        "paper": "https://arxiv.org/abs/1810.04805",
        "text": "Google's Bidirectional Encoder — unlike GPT (left-to-right), BERT reads BOTH directions. Pretrained by masking random words and predicting them from full context.",
        "lineage": "Uses <a href=\"/section/7#model-transformer\">Transformer</a> encoder with <a href=\"/section/7#model-elmo\">ELMo</a>'s bidirectional insight; dominates NLP understanding tasks, while <a href=\"/section/7#model-gpt1\">GPT</a> wins at generation.",
        "formula": "[CLS] The [MASK] sat on the mat [SEP] → predict: cat (bidirectional context!)",
        "module": "/src/demos/bert-section7.js",
        "mount": "mountBert"
      },
      {
        "id": "demo-style",
        "anchorId": "model-stylegan",
        "year": "2018",
        "name": "StyleGAN",
        "paper": "https://arxiv.org/abs/1812.04948",
        "text": "NVIDIA's style-based generator — controls image generation at different scales: coarse features (pose, shape) and fine features (color, texture) via style vectors.",
        "lineage": "Advances <a href=\"/section/6#model-gan\">GAN</a> with style-based control at each resolution level; produces photorealistic faces, later surpassed by <a href=\"/section/8#model-diffusion\">Diffusion Models</a>.",
        "formula": "z → Mapping Network → w → AdaIN at each layer — style control at every resolution",
        "module": "/src/demos/styleGAN-section7.js",
        "mount": "mountStyle"
      },
      {
        "id": "demo-gpt2",
        "anchorId": "model-gpt2",
        "year": "2019",
        "name": "GPT-2",
        "paper": "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf",
        "text": "10× larger than GPT-1 (1.5B params). Showed scaling produces emergent abilities — zero-shot performance without fine-tuning. \"Too dangerous to release.\"",
        "lineage": "Scales <a href=\"/section/7#model-gpt1\">GPT-1</a> 10× to unlock zero-shot abilities; proves the scaling hypothesis that leads to <a href=\"/section/8#model-gpt3\">GPT-3</a> (100× more) and <a href=\"/section/8#model-gpt4\">GPT-4</a>.",
        "formula": "Same as GPT-1 but 10× bigger → emergent zero-shot abilities without fine-tuning!",
        "module": "/src/demos/gpt2-section7.js",
        "mount": "mountGpt2"
      },
      {
        "id": "demo-transformer-xl",
        "anchorId": "model-transformer-xl",
        "year": "2019",
        "name": "Transformer-XL",
        "paper": "https://arxiv.org/abs/1901.02860",
        "text": "Dai et al.'s segment-level recurrence — cache and reuse hidden states from the previous segment, allowing attention to span beyond a fixed context window without full recomputation.",
        "lineage": "Extends <a href=\"/section/7#model-transformer\">Transformer</a> beyond fixed context with segment-level recurrence (like <a href=\"/section/4#model-lstm\">LSTM</a>'s memory but trainable); its relative positional encoding is a precursor to RoPE used in <a href=\"/section/8#model-llama\">LLaMA</a>.",
        "formula": "h̃_τ = [SG(h_{τ-1}) ∘ h_τ]  (segment τ attends to cached segment τ-1) — relative position encoding",
        "module": "/src/demos/transformerXL-section7.js",
        "mount": "mountTransformerXl"
      },
      {
        "id": "demo-t5",
        "anchorId": "model-t5",
        "year": "2019",
        "name": "T5 (Text-to-Text Transfer Transformer)",
        "paper": "https://arxiv.org/abs/1910.10683",
        "text": "Google's unified framework — EVERY NLP task is \"text in, text out\". Translation? Summarization? Classification? One model, one format.",
        "lineage": "Unifies <a href=\"/section/7#model-transformer\">Transformer</a> encoder-decoder for ALL tasks via text prefixes; its \"everything is text\" paradigm merges with <a href=\"/section/7#model-gpt2\">GPT-2</a>'s prompting to create the modern instruction-following AI.",
        "formula": "\"translate English to German: That is good\" → \"Das ist gut\" — everything is text-to-text",
        "module": "/src/demos/t5-section7.js",
        "mount": "mountT5"
      }
    ]
  },
  "8": {
    "id": 8,
    "era": "Section VIII · 2020–2024",
    "color": "var(--a8)",
    "progress": "linear-gradient(90deg,var(--a8),var(--a6))",
    "title": "Foundation Models & The AGI Era",
    "desc": "GPT-3, diffusion models, ChatGPT, and multimodal AI — the models reshaping our world right now.",
    "prev": {
      "label": "Section 7",
      "to": "/section/7"
    },
    "next": null,
    "models": [
      {
        "id": "demo-gpt3",
        "anchorId": "model-gpt3",
        "year": "2020",
        "name": "GPT-3",
        "paper": "https://arxiv.org/abs/2005.14165",
        "text": "175B parameters — 100× GPT-2. Scale alone creates emergent abilities: few-shot learning, reasoning, code generation. No fine-tuning needed.",
        "lineage": "Scales <a href=\"/section/7#model-gpt2\">GPT-2</a> 100× to unlock in-context learning; its few-shot paradigm is refined by <a href=\"/section/8#model-chatgpt\">ChatGPT</a>'s RLHF into the modern AI assistant.",
        "formula": "175B params | zero/one/few-shot via in-context learning — examples in the prompt = \"programming\"",
        "module": "/src/demos/gpt3-section8.js",
        "mount": "mountGpt3"
      },
      {
        "id": "demo-vit",
        "anchorId": "model-vit",
        "year": "2020",
        "name": "ViT (Vision Transformer)",
        "paper": "https://arxiv.org/abs/2010.11929",
        "text": "Cut an image into 16×16 patches, treat each as a \"token\", feed into a standard Transformer. No convolutions needed — attention alone works for vision!",
        "lineage": "Applies <a href=\"/section/7#model-transformer\">Transformer</a> directly to image patches (replacing <a href=\"/section/4#model-cnn\">CNN</a>); enables unified vision-language models like <a href=\"/section/8#model-clip\">CLIP</a> and <a href=\"/section/8#model-gpt4\">GPT-4</a>'s visual understanding.",
        "formula": "Image → 16×16 patches → Linear projection → + Position embedding → Transformer Encoder → Class",
        "module": "/src/demos/vit-section8.js",
        "mount": "mountVit"
      },
      {
        "id": "demo-diff",
        "anchorId": "model-diffusion",
        "year": "2020",
        "name": "Diffusion Models",
        "paper": "https://arxiv.org/abs/2006.11239",
        "text": "Gradually add noise to an image until destroyed, then train a neural net to reverse the process step by step. Generate by starting from pure noise and denoising.",
        "lineage": "Revives <a href=\"/section/5#model-dae\">Denoising Autoencoder</a>'s \"learn to denoise\" principle; combined with <a href=\"/section/8#model-clip\">CLIP</a> text guidance, surpasses <a href=\"/section/6#model-gan\">GAN</a>/<a href=\"/section/7#model-stylegan\">StyleGAN</a> as the dominant generative paradigm (Stable Diffusion, DALL-E, Midjourney).",
        "formula": "Forward: x₀ → x₁ → ... → x_T (pure noise) | Reverse: x_T → ... → x₁ → x₀ (image!)",
        "module": "/src/demos/diffusion-section8.js",
        "mount": "mountDiff"
      },
      {
        "id": "demo-alphafold",
        "anchorId": "model-alphafold",
        "year": "2021",
        "name": "AlphaFold 2",
        "paper": "https://www.nature.com/articles/s41586-021-03819-2",
        "text": "DeepMind's solution to the 50-year protein folding problem. Uses Evoformer transformers over MSA and pair representations, then Invariant Point Attention to predict 3D structures at near-experimental accuracy. Nobel Prize Chemistry 2024.",
        "lineage": "Applies <a href=\"/section/7#model-transformer\">Transformer</a> attention to evolutionary multiple sequence alignments; its structural prediction breakthrough spawned AlphaFold 3, ESMFold, and transformed drug discovery worldwide.",
        "formula": "MSA → Evoformer (48 blocks) → pair repr. → IPA structure module → 3D backbone angles (ψ, φ, ω)",
        "module": "/src/demos/alphaFold-section8.js",
        "mount": "mountAlphaFold"
      },
      {
        "id": "demo-clip",
        "anchorId": "model-clip",
        "year": "2021",
        "name": "CLIP",
        "paper": "https://arxiv.org/abs/2103.00020",
        "text": "Contrastive Language-Image Pretraining — learns to match images with text. Trained on 400M image-text pairs. Enables zero-shot image classification!",
        "lineage": "Pairs <a href=\"/section/8#model-vit\">ViT</a>'s image encoder with a <a href=\"/section/7#model-transformer\">Transformer</a> text encoder via contrastive learning; provides the text-image alignment that powers <a href=\"/section/8#model-diffusion\">Diffusion</a> and <a href=\"/section/8#model-sora\">Sora</a>.",
        "formula": "maximize similarity(image_embed, matching_text_embed) — contrastive learning across modalities",
        "module": "/src/demos/clip-section8.js",
        "mount": "mountClip"
      },
      {
        "id": "demo-rlhf",
        "anchorId": "model-chatgpt",
        "year": "2022",
        "name": "ChatGPT (RLHF)",
        "paper": "https://arxiv.org/abs/2203.02155",
        "text": "The model that changed everything. Three-step training: (1) SFT on human demos, (2) Train reward model on preferences, (3) Optimize with PPO.",
        "lineage": "Applies RLHF (Reinforcement Learning from Human Feedback) to <a href=\"/section/8#model-gpt3\">GPT-3</a>; its alignment approach is refined by <a href=\"/section/8#model-claude\">Claude</a>'s Constitutional AI into scalable AI safety.",
        "formula": "Step 1: SFT → Step 2: Reward Model (human prefs) → Step 3: PPO (maximize reward) = RLHF",
        "module": "/src/demos/rlhf-section8.js",
        "mount": "mountRlhf"
      },
      {
        "id": "demo-stable-diff",
        "anchorId": "model-stable-diffusion",
        "year": "2022",
        "name": "Stable Diffusion (LDM)",
        "paper": "https://arxiv.org/abs/2112.10752",
        "text": "Rombach et al.'s Latent Diffusion Model — run diffusion in the VAE's compressed latent space (8× smaller than pixels), guided by CLIP text embeddings. Makes high-quality generation accessible on consumer hardware.",
        "lineage": "Compresses <a href=\"/section/8#model-diffusion\">Diffusion Models</a>' pixel-space process into <a href=\"/section/6#model-vae\">VAE</a>'s latent space with <a href=\"/section/8#model-clip\">CLIP</a> guidance; open weights (Aug 2022) democratized image generation and enabled <a href=\"/section/8#model-sora\">Sora</a>'s video DiT approach.",
        "formula": "z_T ~ N(0,I) → z_0 via U-Net(z_t, t, τ_θ(text));  CFG: ε̂ = ε_uncond + γ(ε_cond − ε_uncond)",
        "module": "/src/demos/stableDiffusion-section8.js",
        "mount": "mountStableDiffusion"
      },
      {
        "id": "demo-llama",
        "anchorId": "model-llama",
        "year": "2023",
        "name": "LLaMA",
        "paper": "https://arxiv.org/abs/2302.13971",
        "text": "Meta's open-source LLM — smaller models on MORE data match much larger ones. LLaMA-13B matches GPT-3 (175B)! Sparked the open-source revolution.",
        "lineage": "Applies Chinchilla scaling laws to the <a href=\"/section/7#model-transformer\">Transformer</a> decoder; proves efficient training beats brute-force scaling, spawning Alpaca, Vicuna, Mistral, and the open-source LLM ecosystem.",
        "formula": "Key insight: 13B params + 1T tokens > 175B params + 300B tokens — data matters more than size!",
        "module": "/src/demos/llama-section8.js",
        "mount": "mountLlama"
      },
      {
        "id": "demo-gpt4",
        "anchorId": "model-gpt4",
        "year": "2023",
        "name": "GPT-4",
        "paper": "https://arxiv.org/abs/2303.08774",
        "text": "OpenAI's multimodal model — accepts text AND images. Passes the bar exam, writes code, analyzes charts. Rumored MoE at ~1.8T parameters.",
        "lineage": "Combines <a href=\"/section/8#model-gpt3\">GPT-3</a>'s language power with <a href=\"/section/8#model-vit\">ViT</a>'s visual understanding into a multimodal system; uses Mixture-of-Experts for efficiency at massive scale.",
        "formula": "Multimodal: text + image → unified understanding → text output | MoE: only activate relevant experts",
        "module": "/src/demos/gpt4-section8.js",
        "mount": "mountGpt4"
      },
      {
        "id": "demo-gemini",
        "anchorId": "model-gemini",
        "year": "2023",
        "name": "Gemini",
        "paper": "https://arxiv.org/abs/2312.11805",
        "text": "Google DeepMind's natively multimodal model — unlike GPT-4's adapter approach, Gemini is trained from scratch on text, images, audio, and video simultaneously in a unified token space.",
        "lineage": "Unifies <a href=\"/section/7#model-transformer\">Transformer</a> with native multi-modal tokenization across all modalities; evolved into Gemini 1.5/2.0 with 1M+ context window and real-time multimodal agents (Project Astra).",
        "formula": "All modalities → tokenize → shared embedding space → unified Transformer → any-modality output",
        "module": "/src/demos/gemini-section8.js",
        "mount": "mountGemini"
      },
      {
        "id": "demo-claude",
        "anchorId": "model-claude",
        "year": "2024",
        "name": "Claude",
        "paper": "https://arxiv.org/abs/2212.08073",
        "text": "Anthropic's AI trained with Constitutional AI — instead of just human feedback, Claude follows principles to self-critique and improve. Emphasizes helpfulness, honesty, and harmlessness.",
        "lineage": "Improves <a href=\"/section/8#model-chatgpt\">ChatGPT</a>'s RLHF with Constitutional AI (RLAIF): AI self-critiques against written principles → scales alignment without massive human labeling.",
        "formula": "RLHF + Constitutional AI: self-critique against principles → RLAIF (AI feedback from constitution)",
        "module": "/src/demos/claude-section8.js",
        "mount": "mountClaude"
      },
      {
        "id": "demo-sora",
        "anchorId": "model-sora",
        "year": "2024",
        "name": "Sora",
        "paper": "https://openai.com/sora",
        "text": "OpenAI's video generation — up to 60s of high-fidelity video from text. Uses Diffusion Transformer (DiT) on spacetime patches. Understands physics and 3D consistency.",
        "lineage": "Merges <a href=\"/section/8#model-diffusion\">Diffusion Models</a> with <a href=\"/section/7#model-transformer\">Transformer</a> attention on spacetime patches (extending <a href=\"/section/8#model-vit\">ViT</a> to video); represents the frontier of generative AI.",
        "formula": "Text prompt → Spacetime patches → Diffusion Transformer → Video frames (temporal consistency)",
        "module": "/src/demos/sora-section8.js",
        "mount": "mountSora"
      },
      {
        "id": "demo-cot",
        "anchorId": "model-cot",
        "year": "2024",
        "name": "Chain-of-Thought / o1",
        "paper": "https://arxiv.org/abs/2201.11903",
        "text": "Wei et al.'s Chain-of-Thought prompting showed 'Let's think step by step' dramatically improves multi-step reasoning. OpenAI o1 internalizes this as hidden thinking tokens at inference time, reaching human-expert level on AIME math and PhD science benchmarks.",
        "lineage": "Leverages <a href=\"/section/8#model-gpt3\">GPT-3</a>'s emergent reasoning amplified by <a href=\"/section/8#model-chatgpt\">RLHF</a> training on reasoning traces; o1/DeepSeek-R1 (2025) extend CoT into the dominant paradigm for hard reasoning and autonomous AI agents.",
        "formula": "P(answer | question, <think>step₁→step₂→…→stepₙ</think>) ≫ P(answer | question)",
        "module": "/src/demos/cot-section8.js",
        "mount": "mountCot"
      }
    ]
  }
}
