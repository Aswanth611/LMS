const quizzesData = {
  c1: [
    {
      question: "What is the correct syntax to output 'Hello World' in Python?",
      options: ["print('Hello World')", "echo('Hello World')", "p('Hello World')", "System.out.println('Hello World')"],
      answerIndex: 0
    },
    {
      question: "Which of the following is a mutable data structure in Python?",
      options: ["Tuple", "List", "String", "Integer"],
      answerIndex: 1
    },
    {
      question: "How do you start a loop in Python?",
      options: ["for x in y:", "for (x=0; x<y; x++)", "while x < y do:", "loop through y:"],
      answerIndex: 0
    }
  ],
  c2: [
    {
      question: "What is the primary goal of Supervised Learning?",
      options: ["Group data into similar clusters", "Reduce the dimensions of high-dimensional datasets", "Predict outputs for labeled training data", "Train agents to interact with environments"],
      answerIndex: 2
    },
    {
      question: "Which evaluation metric is best suited for highly imbalanced classification datasets?",
      options: ["Accuracy", "F1-Score", "R-squared", "Mean Absolute Error"],
      answerIndex: 1
    },
    {
      question: "What algorithm is commonly used for unsupervised clustering?",
      options: ["K-Means", "Linear Regression", "Decision Tree", "Support Vector Machine"],
      answerIndex: 0
    }
  ],
  c3: [
    {
      question: "What activation function is commonly used in hidden layers of deep neural networks to introduce non-linearity?",
      options: ["ReLU", "Sigmoid", "Linear", "Tanh"],
      answerIndex: 0
    },
    {
      question: "What is the main purpose of the backpropagation algorithm?",
      options: ["Initialize weights randomly", "Calculate gradients of the loss function with respect to weights", "Shuffle input data batches", "Render visual diagrams of the network"],
      answerIndex: 1
    },
    {
      question: "Which neural network architecture is the foundation for modern Large Language Models (LLMs)?",
      options: ["Convolutional Neural Network (CNN)", "Recurrent Neural Network (RNN)", "Transformer", "Self-Organizing Map (SOM)"],
      answerIndex: 2
    }
  ],
  c4: [
    {
      question: "Which HTML5 semantic tag is used to define the main content block of a webpage?",
      options: ["<section>", "<div>", "<main>", "<article>"],
      answerIndex: 2
    },
    {
      question: "How do you center an element vertically and horizontally using CSS Flexbox?",
      options: ["justify-content: center; align-items: center;", "display: center;", "margin: auto;", "text-align: center;"],
      answerIndex: 0
    },
    {
      question: "Which keyword is used to declare a block-scoped variable in modern JavaScript (ES6+)?",
      options: ["var", "let", "define", "const var"],
      answerIndex: 1
    }
  ],
  c5: [
    {
      question: "Which hook is used to perform side effects (fetching data, subscribing to events) in React?",
      options: ["useState", "useContext", "useEffect", "useMemo"],
      answerIndex: 2
    },
    {
      question: "How do you pass data down from a parent component to a child component in React?",
      options: ["Props", "State", "Context API", "Ref"],
      answerIndex: 0
    },
    {
      question: "What is the virtual DOM in React?",
      options: ["A direct copy of the browser HTML document", "A lightweight Javascript representation of the real DOM used for performance optimizations", "A database store for component states", "A visual layout rendering engine"],
      answerIndex: 1
    }
  ],
  c6: [
    {
      question: "Which Python library is primarily used for DataFrames and data manipulation/cleaning?",
      options: ["Matplotlib", "NumPy", "Pandas", "Scikit-Learn"],
      answerIndex: 2
    },
    {
      question: "Which Pandas function is used to drop rows with missing values?",
      options: ["dropna()", "fillna()", "remove_null()", "clean_empty()"],
      answerIndex: 0
    },
    {
      question: "What is a Jupyter Notebook primarily used for?",
      options: ["Deploying web servers", "Compiling C++ code", "Interactive coding, data analysis, and documentation", "Managing SQL database tables"],
      answerIndex: 2
    }
  ],
  c7: [
    {
      question: "How many layers are in the standard OSI networking model?",
      options: ["5", "6", "7", "8"],
      answerIndex: 2
    },
    {
      question: "Which networking protocol translates human-readable domain names (e.g. google.com) to IP addresses?",
      options: ["HTTP", "DHCP", "DNS", "FTP"],
      answerIndex: 2
    },
    {
      question: "What is the primary function of a Firewall?",
      options: ["Encrypt hard drives", "Filter incoming and outgoing network traffic based on security rules", "Speed up download rates", "Generate secure user passwords"],
      answerIndex: 1
    }
  ]
};

module.exports = quizzesData;
