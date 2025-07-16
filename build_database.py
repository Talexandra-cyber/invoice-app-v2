import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"Successfully installed {package}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to install {package}: {e}")
        return False
    return True

def check_and_install_dependencies():
    """Check if required packages are installed and install them if not"""
    required_packages = {
        'chromadb': 'chromadb',
        'openai': 'openai',
        'langchain': 'langchain',
        'langchain-text-splitters': 'langchain-text-splitters',
        'dotenv': 'python-dotenv'
    }
    
    for package_name, pip_name in required_packages.items():
        try:
            __import__(package_name.replace('-', '_'))
            print(f"✓ {package_name} is already installed")
        except ImportError:
            print(f"✗ {package_name} not found. Installing...")
            if not install_package(pip_name):
                print(f"Failed to install {package_name}. Please install manually.")
                return False
    
    return True

# Check and install dependencies
if not check_and_install_dependencies():
    print("Failed to install required dependencies. Exiting.")
    sys.exit(1)

# Import libraries after ensuring they're installed
try:
    import chromadb
    import openai
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    print("✓ All libraries imported successfully")
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

def set_openai_api_key():
    """Set OpenAI API key from environment variable or .env file"""
    # First, try to load from .env file
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✓ Loaded .env file")
    except ImportError:
        print("⚠️  python-dotenv not installed, trying environment variables only")
    except Exception as e:
        print(f"⚠️  Could not load .env file: {e}")
    
    # Get API key from environment
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("⚠️  Warning: OPENAI_API_KEY not found in environment variables or .env file.")
        print("Please either:")
        print("1. Add OPENAI_API_KEY=your-key-here to your .env file, or")
        print("2. Set it using: export OPENAI_API_KEY='your-api-key-here'")
        return None
    
    openai.api_key = api_key
    print("✓ OpenAI API key set successfully")
    return api_key

def load_documents():
    """Load content from both GAD-7 protocol and CBT tips files"""
    documents = {}
    
    # File paths
    files_to_load = {
        'gad7_protocol': 'gad7_protocol.txt',
        'cbt_tips': 'cbt_tips.txt'
    }
    
    for doc_name, file_path in files_to_load.items():
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                documents[doc_name] = content
                print(f"✓ Loaded {file_path} ({len(content)} characters)")
        except FileNotFoundError:
            print(f"✗ File not found: {file_path}")
        except Exception as e:
            print(f"✗ Error loading {file_path}: {e}")
    
    return documents

def split_text_into_chunks(documents, chunk_size=1000, chunk_overlap=200):
    """Split documents into smaller chunks using RecursiveCharacterTextSplitter"""
    
    # Initialize the text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
    )
    
    all_chunks = []
    
    for doc_name, content in documents.items():
        if content:  # Only process if content exists
            # Split the text into chunks
            chunks = text_splitter.split_text(content)
            
            # Add metadata to each chunk
            for i, chunk in enumerate(chunks):
                chunk_data = {
                    'content': chunk,
                    'source': doc_name,
                    'chunk_id': f"{doc_name}_chunk_{i+1}",
                    'chunk_number': i + 1,
                    'total_chunks': len(chunks)
                }
                all_chunks.append(chunk_data)
            
            print(f"✓ Split {doc_name} into {len(chunks)} chunks")
    
    return all_chunks

def initialize_chromadb():
    """Initialize persistent ChromaDB client"""
    try:
        # Create persistent client that saves to local 'db' directory
        client = chromadb.PersistentClient(path="./db")
        print("✓ ChromaDB client initialized successfully")
        return client
    except Exception as e:
        print(f"✗ Error initializing ChromaDB: {e}")
        return None

def get_openai_embeddings(texts, api_key):
    """Generate embeddings using OpenAI's text-embedding-3-small model"""
    if not api_key:
        print("✗ OpenAI API key required for embeddings")
        return None
    
    try:
        # Set up OpenAI client
        client = openai.OpenAI(api_key=api_key)
        
        embeddings = []
        total_texts = len(texts)
        
        print(f"🔄 Generating embeddings for {total_texts} text chunks...")
        
        for i, text in enumerate(texts):
            try:
                response = client.embeddings.create(
                    model="text-embedding-3-small",
                    input=text
                )
                embedding = response.data[0].embedding
                embeddings.append(embedding)
                
                # Progress indicator
                if (i + 1) % 3 == 0 or i == total_texts - 1:
                    print(f"   Progress: {i + 1}/{total_texts} embeddings generated")
                    
            except Exception as e:
                print(f"✗ Error generating embedding for chunk {i+1}: {e}")
                return None
        
        print("✓ All embeddings generated successfully")
        return embeddings
        
    except Exception as e:
        print(f"✗ Error with OpenAI embeddings: {e}")
        return None

def create_vector_database(client, chunks, embeddings):
    """Create ChromaDB collection and add documents with embeddings"""
    try:
        # Try to delete existing collection if it exists
        try:
            client.delete_collection("mental_health_support")
            print("🗑️  Deleted existing collection")
        except:
            pass  # Collection doesn't exist, which is fine
        
        # Create new collection
        collection = client.create_collection(
            name="mental_health_support",
            metadata={"description": "Mental health support documents including GAD-7 protocol and CBT tips"}
        )
        
        # Prepare data for ChromaDB
        ids = [chunk['chunk_id'] for chunk in chunks]
        documents = [chunk['content'] for chunk in chunks]
        metadatas = [
            {
                'source': chunk['source'],
                'chunk_number': chunk['chunk_number'],
                'total_chunks': chunk['total_chunks']
            } 
            for chunk in chunks
        ]
        
        # Add documents to collection
        collection.add(
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        print("✓ Vector database created and populated successfully")
        return collection
        
    except Exception as e:
        print(f"✗ Error creating vector database: {e}")
        return None

def verify_database(collection):
    """Verify the database was created correctly"""
    try:
        # Get collection info
        count = collection.count()
        print(f"📊 Database verification:")
        print(f"   - Collection: mental_health_support")
        print(f"   - Total documents: {count}")
        
        # Show sample document
        if count > 0:
            results = collection.peek(limit=1)
            if results['documents']:
                print(f"   - Sample document preview: {results['documents'][0][:100]}...")
        
        return True
        
    except Exception as e:
        print(f"✗ Error verifying database: {e}")
        return False

def main():
    """Main function to orchestrate the document processing"""
    print("🚀 Starting Document Processing Pipeline")
    print("=" * 50)
    
    # Step 1: Set OpenAI API Key
    print("\n1. Setting up OpenAI API Key...")
    api_key = set_openai_api_key()
    
    if not api_key:
        print("✗ OpenAI API key is required for embeddings. Exiting.")
        return
    
    # Step 2: Load Documents
    print("\n2. Loading documents...")
    documents = load_documents()
    
    if not documents:
        print("✗ No documents loaded. Exiting.")
        return
    
    # Step 3: Split Text into Chunks
    print("\n3. Splitting text into chunks...")
    chunks = split_text_into_chunks(documents)
    
    # Step 4: Initialize ChromaDB
    print("\n4. Initializing ChromaDB...")
    chroma_client = initialize_chromadb()
    
    if not chroma_client:
        print("✗ Failed to initialize ChromaDB. Exiting.")
        return
    
    # Step 5: Generate Embeddings
    print("\n5. Generating embeddings...")
    chunk_texts = [chunk['content'] for chunk in chunks]
    embeddings = get_openai_embeddings(chunk_texts, api_key)
    
    if not embeddings:
        print("✗ Failed to generate embeddings. Exiting.")
        return
    
    # Step 6: Create Vector Database
    print("\n6. Creating vector database...")
    collection = create_vector_database(chroma_client, chunks, embeddings)
    
    if not collection:
        print("✗ Failed to create vector database. Exiting.")
        return
    
    # Step 7: Verify Database
    print("\n7. Verifying database...")
    verify_database(collection)
    
    # Final confirmation
    print("\n" + "=" * 50)
    print("🎉 SUCCESS! Vector Database Created")
    print("=" * 50)
    print("✅ ChromaDB database has been successfully created and populated!")
    print("✅ Database location: ./db/")
    print("✅ Collection name: mental_health_support")
    print(f"✅ Total document chunks stored: {len(chunks)}")
    print("✅ All chunks have been converted to vectors using OpenAI embeddings")
    print("\n🔍 Database Contents:")
    print(f"   - GAD-7 Conversational Protocol chunks")
    print(f"   - CBT & Mindfulness Coping Strategies chunks")
    print(f"   - Each chunk includes source metadata and embeddings")
    print("\n🚀 Your mental health support vector database is ready for use!")
    
    return chunks, collection

if __name__ == "__main__":
    chunks = main() 