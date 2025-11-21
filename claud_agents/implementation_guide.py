"""
PRACTICAL IMPLEMENTATION GUIDE
Real-world integration examples for the multiagent framework
"""

import asyncio
import pandas as pd
import json
from typing import Dict, List, Any
from datetime import datetime, timedelta
import os


# ============================================================================
# REAL DATA SOURCE INTEGRATIONS
# ============================================================================

class DataSourceConnector:
    """
    Handles connections to real data sources
    Replace placeholder implementations with actual API calls
    """
    
    def __init__(self, config: Dict):
        self.config = config
        self.api_keys = config.get("api_keys", {})
    
    # ------------------------------------------------------------------------
    # LEAD DATA SOURCES
    # ------------------------------------------------------------------------
    
    async def fetch_leads_from_csv(self, filepath: str) -> List[Dict]:
        """Fetch leads from CSV file"""
        df = pd.read_csv(filepath)
        
        # Expected columns:
        # lead_id, name, email, phone, age, zip, source, product_interest, 
        # timestamp, homeowner_status
        
        leads = df.to_dict('records')
        
        # Standardize format
        standardized = []
        for lead in leads:
            standardized.append({
                "id": lead.get("lead_id"),
                "name": lead.get("name"),
                "email": lead.get("email"),
                "phone": lead.get("phone"),
                "age": int(lead.get("age", 0)),
                "zip": lead.get("zip"),
                "source": lead.get("source"),
                "product_interest": lead.get("product_interest"),
                "timestamp": lead.get("timestamp"),
                "is_homeowner": lead.get("homeowner_status") == "yes"
            })
        
        return standardized
    
    async def fetch_leads_from_crm_api(self) -> List[Dict]:
        """
        Fetch leads from CRM API (Salesforce, HubSpot, etc.)
        
        Example for HubSpot:
        """
        # import requests
        # 
        # api_key = self.api_keys.get("hubspot")
        # url = "https://api.hubapi.com/crm/v3/objects/contacts"
        # headers = {"Authorization": f"Bearer {api_key}"}
        # 
        # response = requests.get(url, headers=headers)
        # contacts = response.json().get("results", [])
        # 
        # # Transform to standard format
        # leads = []
        # for contact in contacts:
        #     props = contact.get("properties", {})
        #     leads.append({
        #         "id": contact.get("id"),
        #         "name": f"{props.get('firstname', '')} {props.get('lastname', '')}",
        #         "email": props.get("email"),
        #         "phone": props.get("phone"),
        #         "source": props.get("hs_lead_source"),
        #         ...
        #     })
        # 
        # return leads
        
        # Placeholder for now
        return []
    
    # ------------------------------------------------------------------------
    # CUSTOMER DATA
    # ------------------------------------------------------------------------
    
    async def fetch_customer_database(self) -> List[Dict]:
        """Fetch complete customer database with policy information"""
        
        # This would typically come from:
        # - Allstate agency management system
        # - CRM database
        # - Policy management system
        
        # Example structure:
        customers = [
            {
                "customer_id": "C001",
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "805-555-0100",
                "address": "123 Main St, Santa Barbara, CA 93101",
                "age": 45,
                "policies": [
                    {
                        "policy_id": "P001",
                        "type": "auto",
                        "premium": 1200,
                        "start_date": "2020-01-01",
                        "renewal_date": "2025-01-01"
                    },
                    {
                        "policy_id": "P002",
                        "type": "home",
                        "premium": 1800,
                        "start_date": "2020-01-01",
                        "renewal_date": "2025-01-01"
                    }
                ],
                "is_bundled": True,
                "tenure_months": 60,
                "payment_method": "auto-pay",
                "digital_engagement_score": 75,
                "last_contact": "2025-10-15",
                "birthday": "1980-05-15"
            }
        ]
        
        return customers
    
    # ------------------------------------------------------------------------
    # CANCELLATION DATA
    # ------------------------------------------------------------------------
    
    async def fetch_cancellation_report(self, report_path: str) -> List[Dict]:
        """
        Fetch and parse cancellation report
        
        Typically comes from agency management system as CSV or Excel
        """
        df = pd.read_csv(report_path)
        
        # Expected columns:
        # policy_id, customer_id, customer_name, cancellation_reason,
        # effective_date, premium_amount, policy_type, tenure_months
        
        cancellations = []
        for _, row in df.iterrows():
            days_until = (pd.to_datetime(row['effective_date']) - datetime.now()).days
            
            cancellations.append({
                "policy_id": row['policy_id'],
                "customer_id": row['customer_id'],
                "customer_name": row['customer_name'],
                "customer_age": row.get('customer_age', 0),
                "cancellation_reason": row['cancellation_reason'],
                "effective_date": row['effective_date'],
                "days_until_effective": days_until,
                "premium_amount": float(row['premium_amount']),
                "policy_type": row['policy_type'],
                "tenure_months": int(row['tenure_months']),
                "is_bundled": row.get('is_bundled', False)
            })
        
        return cancellations
    
    # ------------------------------------------------------------------------
    # INVOICE DATA
    # ------------------------------------------------------------------------
    
    async def fetch_billing_data(self, billing_cycle: str) -> List[Dict]:
        """Fetch billing data for invoice generation"""
        
        # Would typically pull from:
        # - Allstate billing system
        # - Policy management system
        
        return [
            {
                "customer_id": "C001",
                "invoice_number": "INV-2025-12-001",
                "amount_due": 300.00,
                "due_date": "2025-12-15",
                "policy_numbers": ["P001", "P002"],
                "billing_period": "December 2025",
                "payment_method": "check"
            }
        ]


# ============================================================================
# EXTERNAL SERVICE INTEGRATIONS
# ============================================================================

class ExternalServiceIntegrator:
    """
    Integrations with external services for communication and delivery
    """
    
    def __init__(self, config: Dict):
        self.config = config
        self.api_keys = config.get("api_keys", {})
    
    # ------------------------------------------------------------------------
    # EMAIL SERVICE (SendGrid, Mailgun, etc.)
    # ------------------------------------------------------------------------
    
    async def send_email(self, to_email: str, subject: str, 
                        html_content: str, from_email: str = None) -> bool:
        """
        Send email via SendGrid
        
        pip install sendgrid
        """
        # from sendgrid import SendGridAPIClient
        # from sendgrid.helpers.mail import Mail
        # 
        # api_key = self.api_keys.get("sendgrid")
        # 
        # message = Mail(
        #     from_email=from_email or "noreply@allstatesb.com",
        #     to_emails=to_email,
        #     subject=subject,
        #     html_content=html_content
        # )
        # 
        # try:
        #     sg = SendGridAPIClient(api_key)
        #     response = sg.send(message)
        #     return response.status_code == 202
        # except Exception as e:
        #     print(f"Email send failed: {e}")
        #     return False
        
        print(f"📧 Email sent to {to_email}: {subject}")
        return True
    
    async def send_bulk_email(self, recipients: List[Dict]) -> Dict:
        """Send bulk emails (newsletters, etc.)"""
        
        sent = 0
        failed = 0
        
        for recipient in recipients:
            success = await self.send_email(
                to_email=recipient['email'],
                subject=recipient['subject'],
                html_content=recipient['content']
            )
            
            if success:
                sent += 1
            else:
                failed += 1
        
        return {
            "sent": sent,
            "failed": failed,
            "total": len(recipients)
        }
    
    # ------------------------------------------------------------------------
    # SMS SERVICE (Twilio)
    # ------------------------------------------------------------------------
    
    async def send_sms(self, to_phone: str, message: str) -> bool:
        """
        Send SMS via Twilio
        
        pip install twilio
        """
        # from twilio.rest import Client
        # 
        # account_sid = self.api_keys.get("twilio_sid")
        # auth_token = self.api_keys.get("twilio_token")
        # from_phone = self.config.get("twilio_phone")
        # 
        # client = Client(account_sid, auth_token)
        # 
        # try:
        #     message = client.messages.create(
        #         body=message,
        #         from_=from_phone,
        #         to=to_phone
        #     )
        #     return message.sid is not None
        # except Exception as e:
        #     print(f"SMS send failed: {e}")
        #     return False
        
        print(f"📱 SMS sent to {to_phone}: {message[:50]}...")
        return True
    
    # ------------------------------------------------------------------------
    # MAIL SERVICE (Lob for physical mail)
    # ------------------------------------------------------------------------
    
    async def send_physical_mail(self, recipient: Dict, 
                                 document_path: str) -> Dict:
        """
        Send physical mail via Lob
        
        pip install lob
        """
        # import lob
        # 
        # lob.api_key = self.api_keys.get("lob")
        # 
        # try:
        #     letter = lob.Letter.create(
        #         description="Invoice",
        #         to_address={
        #             "name": recipient["name"],
        #             "address_line1": recipient["address_line1"],
        #             "address_city": recipient["city"],
        #             "address_state": recipient["state"],
        #             "address_zip": recipient["zip"]
        #         },
        #         from_address={
        #             "name": "Derrick Bealer - Allstate",
        #             "address_line1": "123 Agency St",
        #             "address_city": "Santa Barbara",
        #             "address_state": "CA",
        #             "address_zip": "93101"
        #         },
        #         file=document_path,
        #         color=True
        #     )
        #     
        #     return {
        #         "success": True,
        #         "tracking_id": letter.id,
        #         "expected_delivery": letter.expected_delivery_date
        #     }
        # except Exception as e:
        #     return {
        #         "success": False,
        #         "error": str(e)
        #     }
        
        print(f"📬 Physical mail scheduled for {recipient['name']}")
        return {
            "success": True,
            "tracking_id": "LOB_123456",
            "expected_delivery": "2025-12-05"
        }
    
    async def batch_mail(self, batch: List[Dict]) -> Dict:
        """Send batch of physical mail"""
        
        sent = 0
        failed = 0
        tracking_ids = []
        
        for item in batch:
            result = await self.send_physical_mail(
                recipient=item["recipient"],
                document_path=item["document_path"]
            )
            
            if result["success"]:
                sent += 1
                tracking_ids.append(result["tracking_id"])
            else:
                failed += 1
        
        return {
            "sent": sent,
            "failed": failed,
            "total": len(batch),
            "tracking_ids": tracking_ids
        }
    
    # ------------------------------------------------------------------------
    # SOCIAL MEDIA ADS (Meta/Facebook Business API)
    # ------------------------------------------------------------------------
    
    async def create_facebook_campaign(self, campaign_config: Dict) -> Dict:
        """
        Create Facebook/Instagram ad campaign
        
        pip install facebook-business
        """
        # from facebook_business.api import FacebookAdsApi
        # from facebook_business.adobjects.campaign import Campaign
        # from facebook_business.adobjects.adset import AdSet
        # from facebook_business.adobjects.ad import Ad
        # 
        # # Initialize API
        # api_key = self.api_keys.get("facebook")
        # app_secret = self.api_keys.get("facebook_secret")
        # access_token = self.api_keys.get("facebook_token")
        # ad_account_id = self.config.get("facebook_ad_account")
        # 
        # FacebookAdsApi.init(api_key, app_secret, access_token)
        # 
        # # Create campaign
        # campaign = Campaign(parent_id=ad_account_id)
        # campaign.update({
        #     Campaign.Field.name: campaign_config["name"],
        #     Campaign.Field.objective: Campaign.Objective.lead_generation,
        #     Campaign.Field.status: Campaign.Status.paused
        # })
        # campaign.remote_create()
        # 
        # return {
        #     "campaign_id": campaign.get_id(),
        #     "status": "created"
        # }
        
        print(f"🎯 Facebook campaign created: {campaign_config['name']}")
        return {
            "campaign_id": "FB_CAMP_12345",
            "status": "created",
            "estimated_reach": 25000
        }


# ============================================================================
# MACHINE LEARNING MODEL INTEGRATION
# ============================================================================

class MLModelIntegrator:
    """
    Integration with ML models for predictions
    """
    
    def __init__(self, model_dir: str = "./models"):
        self.model_dir = model_dir
        self.models = {}
    
    async def load_lead_scoring_model(self):
        """
        Load lead scoring model
        
        Could be:
        - scikit-learn model
        - XGBoost model
        - Neural network
        - Or Claude API for predictions
        """
        # import joblib
        # model_path = os.path.join(self.model_dir, "lead_scoring_model.pkl")
        # self.models['lead_scoring'] = joblib.load(model_path)
        
        print("✅ Lead scoring model loaded")
    
    async def predict_lead_score(self, lead_features: Dict) -> float:
        """
        Predict lead conversion probability
        
        Features:
        - age, zip, homeowner_status, product_interest
        - lead_source, day_of_week, hour_of_day
        - historical_source_performance
        """
        # model = self.models.get('lead_scoring')
        # if not model:
        #     await self.load_lead_scoring_model()
        #     model = self.models['lead_scoring']
        # 
        # # Prepare features
        # feature_vector = self._prepare_lead_features(lead_features)
        # 
        # # Predict
        # probability = model.predict_proba([feature_vector])[0][1]
        # 
        # return probability * 100  # Return 0-100 score
        
        # Placeholder scoring logic
        score = 50  # Base score
        
        if lead_features.get('is_homeowner'):
            score += 20
        if lead_features.get('age', 0) > 35:
            score += 10
        if lead_features.get('source') == 'referral':
            score += 15
        
        return min(100, score)
    
    def _prepare_lead_features(self, lead: Dict) -> list:
        """Transform lead data into model features"""
        # Feature engineering
        features = [
            lead.get('age', 0),
            1 if lead.get('is_homeowner') else 0,
            # ... more features
        ]
        return features
    
    async def predict_saveability(self, cancellation: Dict) -> float:
        """Predict likelihood of saving a cancellation"""
        
        score = 50  # Base
        
        reason = cancellation.get('cancellation_reason', '')
        if reason == 'non_payment':
            score += 20
        elif reason == 'rate_increase':
            score += 10
        elif reason == 'moving':
            score -= 20
        
        if cancellation.get('tenure_months', 0) > 24:
            score += 15
        
        if cancellation.get('is_bundled'):
            score += 20
        
        return min(100, max(0, score))


# ============================================================================
# COMPLETE PRODUCTION EXAMPLE
# ============================================================================

async def production_workflow_example():
    """
    Complete example showing real-world integration
    """
    print("\n" + "="*70)
    print("PRODUCTION WORKFLOW EXAMPLE")
    print("="*70 + "\n")
    
    # Initialize integrators
    config = {
        "api_keys": {
            "sendgrid": "YOUR_SENDGRID_KEY",
            "twilio_sid": "YOUR_TWILIO_SID",
            "twilio_token": "YOUR_TWILIO_TOKEN",
            "lob": "YOUR_LOB_KEY",
            "facebook": "YOUR_FB_KEY"
        }
    }
    
    data_connector = DataSourceConnector(config)
    service_integrator = ExternalServiceIntegrator(config)
    ml_integrator = MLModelIntegrator()
    
    # 1. FETCH REAL DATA
    print("📊 Fetching data from sources...")
    
    leads = await data_connector.fetch_leads_from_csv("leads_today.csv")
    customers = await data_connector.fetch_customer_database()
    cancellations = await data_connector.fetch_cancellation_report("cancel_report.csv")
    
    print(f"   Leads: {len(leads)}")
    print(f"   Customers: {len(customers)}")
    print(f"   Cancellations: {len(cancellations)}")
    
    # 2. SCORE LEADS WITH ML MODEL
    print("\n🤖 Scoring leads with ML model...")
    
    scored_leads = []
    for lead in leads[:5]:  # First 5 for example
        score = await ml_integrator.predict_lead_score({
            "age": lead["age"],
            "is_homeowner": lead["is_homeowner"],
            "source": lead["source"],
            "product_interest": lead["product_interest"]
        })
        
        scored_leads.append({
            **lead,
            "score": score,
            "priority": "high" if score > 70 else "medium" if score > 40 else "low"
        })
        
        print(f"   {lead['name']}: Score {score:.0f}/100 ({scored_leads[-1]['priority']} priority)")
    
    # 3. ANALYZE CANCELLATIONS
    print("\n⚠️  Analyzing cancellations...")
    
    at_risk_premium = 0
    high_priority_saves = []
    
    for cancel in cancellations[:5]:  # First 5 for example
        saveability = await ml_integrator.predict_saveability(cancel)
        at_risk_premium += cancel["premium_amount"]
        
        if saveability > 60:
            high_priority_saves.append({
                **cancel,
                "saveability_score": saveability
            })
            print(f"   {cancel['customer_name']}: ${cancel['premium_amount']:.0f} "
                  f"(Saveability: {saveability:.0f}/100)")
    
    print(f"\n   Total premium at risk: ${at_risk_premium:,.2f}")
    print(f"   High-priority saves: {len(high_priority_saves)}")
    
    # 4. SEND OUTREACH COMMUNICATIONS
    print("\n📧 Sending outreach communications...")
    
    # Email to high-priority leads
    email_sent = await service_integrator.send_email(
        to_email=scored_leads[0]["email"],
        subject="Get a Free Insurance Quote - Personalized for You",
        html_content=f"""
        <h2>Hi {scored_leads[0]['name']},</h2>
        <p>Thanks for your interest! I'd love to help you find the perfect 
        {scored_leads[0]['product_interest']} insurance coverage.</p>
        <p>Best regards,<br>Derrick Bealer - Allstate</p>
        """
    )
    
    print(f"   Email sent: {email_sent}")
    
    # SMS to at-risk customer
    if high_priority_saves:
        cancel = high_priority_saves[0]
        sms_sent = await service_integrator.send_sms(
            to_phone=cancel.get("phone", "805-555-0100"),
            message=f"Hi {cancel['customer_name']}, I noticed your policy is at risk. "
                   f"Let's talk today to see if we can find a solution. - Derrick"
        )
        print(f"   SMS sent: {sms_sent}")
    
    # 5. GENERATE AND MAIL INVOICES
    print("\n📬 Processing invoice mailing...")
    
    # Identify paper customers (age 65+, check payment)
    paper_customers = [
        c for c in customers 
        if c["age"] >= 65 or c["payment_method"] == "check"
    ]
    
    print(f"   Identified {len(paper_customers)} customers needing paper invoices")
    
    # Prepare mailing batch
    mail_batch = []
    for customer in paper_customers[:3]:  # First 3 for example
        mail_batch.append({
            "recipient": {
                "name": customer["name"],
                "address_line1": customer["address"].split(",")[0],
                "city": "Santa Barbara",
                "state": "CA",
                "zip": customer["address"].split()[-1]
            },
            "document_path": f"invoices/{customer['customer_id']}.pdf"
        })
    
    mail_result = await service_integrator.batch_mail(mail_batch)
    print(f"   Mailed: {mail_result['sent']}/{mail_result['total']}")
    
    # 6. LAUNCH SOCIAL CAMPAIGN
    print("\n🎯 Launching social media campaign...")
    
    campaign_result = await service_integrator.create_facebook_campaign({
        "name": "December Auto Insurance - Santa Barbara",
        "budget": 2000,
        "duration_days": 14,
        "target_audience": "homeowners_35_65",
        "creative_type": "carousel"
    })
    
    print(f"   Campaign ID: {campaign_result['campaign_id']}")
    print(f"   Estimated reach: {campaign_result.get('estimated_reach', 0):,}")
    
    print("\n✨ Production workflow complete!\n")


# ============================================================================
# CONFIGURATION TEMPLATE
# ============================================================================

def create_config_template():
    """Create a configuration template file"""
    
    config = {
        "api_keys": {
            "sendgrid": "YOUR_SENDGRID_API_KEY",
            "twilio_sid": "YOUR_TWILIO_ACCOUNT_SID",
            "twilio_token": "YOUR_TWILIO_AUTH_TOKEN",
            "lob": "YOUR_LOB_API_KEY",
            "facebook": "YOUR_FB_APP_ID",
            "facebook_secret": "YOUR_FB_APP_SECRET",
            "facebook_token": "YOUR_FB_ACCESS_TOKEN",
            "hubspot": "YOUR_HUBSPOT_API_KEY"
        },
        "data_sources": {
            "leads_csv": "path/to/leads.csv",
            "customer_db": "path/to/customer_database.csv",
            "cancel_reports": "path/to/cancellation_reports/"
        },
        "service_config": {
            "twilio_phone": "+18055550100",
            "from_email": "noreply@allstatesb.com",
            "facebook_ad_account": "act_123456789"
        },
        "model_config": {
            "model_dir": "./models",
            "lead_scoring_model": "lead_scoring_v1.pkl",
            "cancellation_model": "cancellation_v1.pkl"
        },
        "thresholds": {
            "high_priority_lead_score": 70,
            "medium_priority_lead_score": 40,
            "saveability_threshold": 60,
            "paper_customer_age": 65
        }
    }
    
    with open("config.json", "w") as f:
        json.dump(config, indent=2, fp=f)
    
    print("✅ Configuration template created: config.json")


if __name__ == "__main__":
    # Create config template
    create_config_template()
    
    # Run production example
    asyncio.run(production_workflow_example())
