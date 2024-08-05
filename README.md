# Visualise Embeddings PoC
Visualising embedding databases with the DBPedia dataset, transformers-js, mini-LM, PGVector, D3, Plotly.

### How to use
1. Enter a question into each box and press submit. This will perform a vector search of the DBPedia dataset, which is a sub-sample of wikipedia articles.
2. Wait for results to be returned.
3. Use the sliders to 'scrub' the 3d scatterplot to investigate how results are associated with eachother by the language model. Texts which are closer together in the vector space are considered more semantically similar based on the model's encoding of it's training data.


### Background
Embeddings and vector databases are important for understanding how LLMs work, and LLM based architectures like Retrieval Augmented Generation. 

It's difficult to imagine what it means for words, sentences, paragraphs to be clustered together in an n-dimensional vector space though, and this project was about using visualisation to help get a grip on that.

I used the 'DBPedia' dataset from kaggle as the datasource, Postgres + PGVector as the VectorDB, and got to learn how to use the  visualisation tools D3 and Plotly.

Recently, I've been working on using Retrieval Augemented Generation to create AI enabled products for big orgs. A common finding among developers has been that the retrieval stage of the process is the biggest bottleneck.
The conventional approach is to embed all the documents into a 1536 dimensional space using ada-2 or ada-3, but what if the results are just as good by using a much smaller space?

Because searching vector databases is basically a KNN search that will always return results, it's hard to tell how efficient our search process really is. Would we get much better results from a 4000+ dimensional embedding space using ada-3-large? Or, would a simple keyword search return the exact same results?? It's difficult to know in advance...

These Experiments with using self-hosted embeddings service opens up a lot of new tricks. RAG chunking strategies like sliding window, recursive paragraph chunking, etc. become much cheaper. On device embedding could become an option, and so on.



### Stuff that would have been cool
- Integration with LangChain vectorstore interface
- Principal Component Analysis (or other dimensionality reduction).
- ONNX runtime embeddings. 
- IndexedDB as the vector store.
- More interesting use cases?

## Still working out a way to make visualisation more meaningful
It doesn't seem likely to me that chat conversations are the final form of how we will interact with llms / ai.
RAG processes and vector databases always seemed to me like an extra layer between users and models, which are more amenable to representation than models themselves. 
I still believe this, but I don't think I've found a great use case yet.