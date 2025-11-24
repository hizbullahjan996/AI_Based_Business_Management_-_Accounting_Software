# AI-Enhanced Business Management Software

A comprehensive, production-ready business management and accounting software with AI-powered insights, predictive analytics, and automated WhatsApp notifications.

## 🚀 Features

### Core Business Modules
- **User Management**: Multi-company support with role-based access control
- **Dashboard**: Real-time business metrics and AI insights
- **Parties Management**: Customer and supplier relationship management
- **Inventory Management**: Stock tracking with automated alerts
- **Sales & Purchase**: Complete invoicing and order management
- **Payments**: Automated payment tracking and reminders
- **Expenses**: Comprehensive expense tracking and categorization
- **Reports**: Professional business reports and analytics

### AI-Powered Features
- **Demand Prediction**: AI forecasts inventory needs based on sales patterns
- **Payment Recommendations**: Smart payment collection strategies
- **Business Insights**: AI-generated business optimization recommendations
- **Natural Language Queries**: Ask questions about your business in plain English
- **Seasonal Analysis**: Predict demand changes based on seasonal patterns

### WhatsApp Integration
- **Automated Notifications**: Invoice updates, payment reminders
- **Customer Communication**: WhatsApp messaging for business updates
- **Template System**: Customizable message templates
- **Delivery Tracking**: Monitor message delivery status

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js/Express.js with PostgreSQL/SQLite
- **Frontend**: React.js with TypeScript and Material-UI
- **AI Service**: Python with FastAPI, scikit-learn, pandas
- **Database**: PostgreSQL (production) / SQLite (development)
- **Cache**: Redis for session management
- **Messaging**: Meta WhatsApp Business API

### System Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Service    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Python)      │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │ PostgreSQL/     │
                       │ SQLite          │
                       └─────────────────┘
```

## 📁 Project Structure

```
business-software/
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── modules/        # Business modules
│   │   │   └── ai/         # AI integration module
│   │   ├── core/           # Core services
│   │   │   ├── database/
│   │   │   ├── whatsapp/
│   │   │   └── security/
│   │   ├── shared/         # Shared utilities
│   │   └── app.js          # Main application
│   ├── migrations/         # Database migrations
│   ├── tests/              # Backend tests
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── dashboard/
│   │   │   ├── ai/         # AI dashboard components
│   │   │   └── common/
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── ai-service/             # Python AI service
│   ├── models/             # AI models
│   │   ├── demand_predictor.py
│   │   ├── payment_recommender.py
│   │   └── business_analyzer.py
│   ├── utils/              # Utility functions
│   ├── main.py             # FastAPI application
│   └── requirements.txt
├── docker/                 # Docker configuration
├── docs/                   # Documentation
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- PostgreSQL 12+ (optional, SQLite for development)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd business-software
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables in .env
# Edit database connection, JWT secrets, WhatsApp API keys, etc.

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### 3. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt

# Start AI service
python main.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm start
```

### 5. Docker Setup (Alternative)
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run individual services
docker-compose up backend ai-service frontend
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/business_db
SQLITE_DB_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_API_VERSION=v17.0

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_API_KEY=your-ai-service-key

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### AI Service (.env)
```env
# Database connection (same as backend)
DATABASE_URL=postgresql://username:password@localhost:5432/business_db
SQLITE_URL=sqlite:///./database.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

## 📊 AI Features Usage

### 1. Demand Prediction
```javascript
// Get demand predictions with budget allocation
const predictions = await aiService.getDemandPredictions({
  company_id: 1,
  budget: 500000, // PKR
  days_ahead: 90
});
```

### 2. Payment Recommendations
```javascript
// Get payment collection recommendations
const recommendations = await aiService.getPaymentRecommendations({
  company_id: 1
});
```

### 3. Business Insights
```javascript
// Get AI-generated business insights
const insights = await aiService.getBusinessInsights({
  company_id: 1
});
```

### 4. Natural Language Queries
```javascript
// Ask business questions in natural language
const response = await aiService.processBusinessQuery({
  company_id: 1,
  query: "What is my profit margin this month?"
});
```

## 📱 WhatsApp Integration

### Setup WhatsApp Business API
1. Create a Facebook App and WhatsApp Business Account
2. Get your access token and phone number ID
3. Configure webhooks for message delivery status
4. Add credentials to your .env file

### Available Templates
- `invoice_notification`: Send invoice details to customers
- `payment_reminder`: Automated payment reminders
- `payment_confirmation`: Payment received confirmations
- `low_stock_alert`: Inventory low stock notifications

### Usage Examples
```javascript
// Send invoice notification
await whatsappService.sendInvoiceNotification(
  '+923001234567', 
  {
    customerName: 'John Doe',
    items: [{ name: 'Product A', quantity: 2, price: 1000 }],
    total: 2000,
    invoiceNumber: 'INV-001'
  }
);

// Send payment reminder
await whatsappService.sendPaymentReminder(
  '+923001234567',
  {
    customerName: 'John Doe',
    outstandingAmount: 5000,
    dueDate: '2024-12-31'
  }
);
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### AI Service Tests
```bash
cd ai-service
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Performance Optimization

### For New Businesses
- **Cold Start Solution**: AI starts with industry benchmarks
- **Progressive Learning**: Models improve as more data is collected
- **Fallback Systems**: Rule-based recommendations when ML data is insufficient
- **Benchmark Comparison**: Compare against industry standards

### Scalability Features
- **Caching**: Redis for frequently accessed data
- **Database Indexing**: Optimized queries for large datasets
- **Background Jobs**: Async processing for heavy AI computations
- **Rate Limiting**: Protect against abuse

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Fine-grained permissions
- **Input Validation**: Joi schema validation
- **Rate Limiting**: API abuse protection
- **CORS Configuration**: Secure cross-origin requests
- **Password Hashing**: bcrypt for secure storage

## 📚 API Documentation

### AI Endpoints
- `GET /api/v1/ai/predictions/demand` - Get demand predictions
- `GET /api/v1/ai/recommendations/payments` - Get payment recommendations
- `GET /api/v1/ai/insights/business` - Get business insights
- `POST /api/v1/ai/query` - Process natural language queries
- `POST /api/v1/ai/train` - Train AI models
- `GET /api/v1/ai/status` - Get model status

### Authentication
All AI endpoints require JWT authentication via Bearer token.

## 🚀 Deployment

### Production Deployment
1. Set up PostgreSQL database
2. Configure environment variables for production
3. Build frontend: `npm run build`
4. Start services with PM2 or Docker
5. Set up reverse proxy (Nginx)
6. Configure SSL certificates

### Environment-Specific Configurations
- **Development**: SQLite + Debug logging
- **Staging**: PostgreSQL + Warning logs
- **Production**: PostgreSQL + Error logs only

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@hecbusiness.com
- Documentation: [Wiki](../../wiki)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting with PDF export
- [ ] Integration with accounting software (QuickBooks, Tally)
- [ ] Multi-currency support
- [ ] Advanced tax management
- [ ] Supply chain optimization
- [ ] Financial forecasting
- [ ] Customer analytics dashboard

---

**Built with ❤️ by HEC Business Software Team**"# AI_Based_Business_Management_-_Accounting_Software" 
