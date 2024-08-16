# Search Craft

This project provides a backend API for managing and searching product information using Express.js and MongoDB. The API supports filtering, sorting, and pagination of product data.

## Features

- **Search:** Search products by name using case-insensitive queries.
- **Filters:** Filter products by category, brand, and price range.
- **Sorting:** Sort products by price or creation date in ascending or descending order.
- **Pagination:** View products page by page with customizable page size.

## Project Setup

### Prerequisites

- Node.js (v14.x or higher)
- MongoDB (either installed locally or using a service like MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/backend-repo.git
   cd backend-repo
Install dependencies: npm install

bash
Copy code
npm install
Create a .env file:

In the root of the project, create a .env file and add the following environment variables:

bash
Copy code
PORT=5000
DB_USER=your_db_user
DB_PASS=your_db_password
Replace your_db_user and your_db_password with your actual MongoDB credentials.

Start the server: npm start

bash
Copy code
npm start
The server should now be running on http://localhost:5000.

API Endpoints
GET /information - Fetch a paginated list of products with optional filters, sorting, and search.
Running the Project Locally
Make sure your MongoDB instance is running.
Start the server using npm start.
The API will be available at http://localhost:5000.