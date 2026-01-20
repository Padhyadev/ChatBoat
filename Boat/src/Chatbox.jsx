import React, { useState, useEffect, useRef } from 'react';
import './Chatbox.css';

// ----------------------------------------------------------------------------
// API CONFIGURATION
// ----------------------------------------------------------------------------
// const API_BASE_URL = "https://localhost:7228/api";
const API_BASE_URL = "https://hindapinew.padhyasoft.com/api";


const FloatingChatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // flow steps
  const [step, setStep] = useState('init'); 
  
  // Data States
  const [userData, setUserData] = useState({ name: '', phone: '' });
  const [leadId, setLeadId] = useState(null); 
  
  const [selectedService, setSelectedService] = useState(null); 
  const [selectedSubService, setSelectedSubService] = useState(null); 
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [projectData, setProjectData] = useState({ projectName: '', projectDescription: '', budget: '', timeline: '' });
  const [supportData, setSupportData] = useState({ enquiryTypeId: 0, description: '', contactInfo: '' });
  const [expertData, setExpertData] = useState({ name: '', contact: '', preferredCallTime: '' });

  const [inputVal, setInputVal] = useState('');
  
  const messagesEndRef = useRef(null);

  // ----------------------------------------------------------------------------
  // API HELPER FUNCTIONS
  // ----------------------------------------------------------------------------
  const commonHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  const saveLead = async (name, phone) => {
    try {
      console.log("Saving lead:", { name, phone });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); 

      // Strict User Schema
      const payload = {
        leadId: 0,
        name: name,
        phone: phone,
        service: 0,
        subService: 0,
        platformOpation: 0,
        serviceMasterId: 0, // Added as per new requirement
        action: ""
      };

      const response = await fetch(`${API_BASE_URL}/Leads/Add`, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const result = await response.text();
      console.log("Lead API Raw Response:", result);
      
      const cleanResult = result.replace(/^"|"$/g, ''); 
      
      if (cleanResult && cleanResult.includes('|')) {
        const parts = cleanResult.split('|');
        if (parts.length >= 3) {
          const id = parseInt(parts[2].trim());
          if (!isNaN(id)) {
            setLeadId(id);
            console.log("✅ Lead saved successfully with ID:", id);
            return id;
          }
        }
      }
      
      const possibleId = parseInt(cleanResult);
      if (!isNaN(possibleId)) {
        setLeadId(possibleId);
        return possibleId;
      }

      return null;
    } catch (error) {
      console.error("Error saving lead:", error);
      return null;
    }
  };

  // Flexible partial update function
  const updateLeadPartial = async (currentLeadId, changeObj) => {
    if (!currentLeadId) {
       console.warn("Skipping update - No Lead ID");
       return false;
    }

    try {
      // Construct payload strictly based on user request (LeadId + specific field)
      const payload = {
        leadId: currentLeadId,
        ...changeObj
      };

      console.log("🔄 Updating lead (Partial):", payload);

      // Using Leads/Add for update as per user instruction (Update returns 404)
      const response = await fetch(`${API_BASE_URL}/Leads/Add`, {
        method: 'POST', 
        headers: commonHeaders,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
         console.log("✅ Lead updated successfully");
         const resText = await response.text();
         console.log("Update Response:", resText);
         return true;
      }
      
      console.error(`❌ Lead update failed: ${response.status}`);
      return false;
    } catch (error) {
      console.error("Error updating lead:", error);
      return false;
    }
  };

  const fetchServices = async () => {
    try {
      console.log("Fetching services...");
      // Reverted to Services endpoint as per request
      const response = await fetch(`${API_BASE_URL}/Services/GetAllpage?start=0&length=10&sortColumnDir=asc`, {
          method: 'GET',
          headers: commonHeaders
      });
      
      const data = await response.json();
      console.log("Services API Response:", data);
      
      let list = [];
      if (data.data && data.data.data && Array.isArray(data.data.data)) {
          list = data.data.data;
      }
      else if (data.data && Array.isArray(data.data)) {
          list = data.data;
      }
      else if (Array.isArray(data)) {
          list = data;
      }
      
      return list;
    } catch (error) {
      console.error("Error fetching services:", error);
      return [];
    }
  };

  const fetchSubServices = async (serviceId) => {
    try {
      const url = `${API_BASE_URL}/SubService/Subservicefilterbyservice?ServiceId=${serviceId}`;
      console.log("📍 Fetching Sub-Services from:", url);
      
      const response = await fetch(url, {
          method: 'GET',
          headers: commonHeaders
      });
      const data = await response.json();
      
      let list = [];
      if (data.data && Array.isArray(data.data)) list = data.data;
      else if (Array.isArray(data)) list = data;
      else if (typeof data === 'object') list = Object.values(data); 

      return list;
    } catch (error) {
      console.error("Error fetching sub-services:", error);
      return [];
    }
  };

  const fetchPlatformOptions = async (serviceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Platformoptions/PlatformoptionsbyService?ServiceId=${serviceId}`, {
          method: 'GET',
          headers: commonHeaders
      });
      const data = await response.json();
      
      let list = [];
      if (data.data && Array.isArray(data.data)) list = data.data;
      else if (Array.isArray(data)) list = data;
      else if (typeof data === 'object') list = Object.values(data);

      return list;
    } catch (error) {
      console.error("Error fetching platform options:", error);
      return [];
    }
  };

  const fetchMasterServices = async () => {
      try {
        console.log("Fetching Master Services...");
        const response = await fetch(`${API_BASE_URL}/MasterServices/GetAllpage?start=0&length=10&sortColumnDir=asc`, {
            method: 'GET',
            headers: commonHeaders
        });
        const data = await response.json();
        
        let list = [];
        if (data.data && data.data.data && Array.isArray(data.data.data)) {
            list = data.data.data;
        } else if (data.data && Array.isArray(data.data)) {
            list = data.data;
        } else if (Array.isArray(data)) {
            list = data;
        }
        return list;
      } catch (error) {
        console.error("Error fetching Master Services:", error);
        return [];
      }
  };

  const fetchEnquiryTypes = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/EnquiryType/GetAllpage?start=0&length=10&sortColumnDir=asc`, {
            method: 'GET',
            headers: commonHeaders
        });
        const data = await response.json();
        let list = [];
        if (data.data && data.data.data && Array.isArray(data.data.data)) {
            list = data.data.data;
        } else if (data.data && Array.isArray(data.data)) {
            list = data.data;
        } else if (Array.isArray(data)) {
            list = data;
        }
        return list;
    } catch (error) {
        console.error("Error fetching Enquiry Types:", error);
        return [];
    }
  };

  const saveSupportContact = async (data) => {
      try {
          if (!leadId) {
              console.error("❌ Cannot save Support Contact: No Lead ID");
              return false;
          }
          
          const payload = {
              id: 0,
              enquiryTypeId: data.enquiryTypeId,
              leadId: leadId,
              description: data.description,
              contact: data.contactInfo
          };
          
          console.log("📤 Saving Support Contact with payload:", payload);
          console.log("📍 API URL:", `${API_BASE_URL}/SupportContactFlow/Save`);
          
          const response = await fetch(`${API_BASE_URL}/SupportContactFlow/Save`, {
              method: 'POST',
              headers: commonHeaders,
              body: JSON.stringify(payload)
          });
          
          console.log("📥 Support Contact API Response Status:", response.status);
          
          if (response.ok) {
              const responseText = await response.text();
              console.log("✅ Support Contact saved successfully:", responseText);
              return true;
          } else {
              const errorText = await response.text();
              console.error(`❌ Support Contact save failed (${response.status}):`, errorText);
              return false;
          }
      } catch (error) {
          console.error("❌ Error saving support contact:", error);
          return false;
      }
  };

  const saveProjectQuote = async (data) => {
    try {
      if (!leadId) return;
      console.log("Saving Project Quote:", data);
      
      const payload = {
          projectQuoteId: 0,
          leadId: leadId,
          projectName: data.projectName,
          projectDescription: data.projectDescription,
          budget: data.budget,
          timeline: data.timeline,
          createdAt: new Date().toISOString()
      };

      await fetch(`${API_BASE_URL}/ProjectQuotes/Add`, {
          method: 'POST',
          headers: commonHeaders,
          body: JSON.stringify(payload)
      });
      console.log("Project Quote saved.");
    } catch (error) {
      console.error("Error saving project quote:", error);
    }
  };

  const saveTalkToExpert = async (data) => {
    try {
      if (!leadId) {
        console.error("❌ Cannot save Talk to Expert: No Lead ID");
        return false;
      }
      
      // Backend API expects this exact structure
      const payload = {
        id: 0,
        email: data.contact,
        preferredCallTime: data.preferredCallTime,
        leadId: leadId,
        createdDate: new Date().toISOString()
      };
      
      console.log("📤 Saving Talk to Expert with payload:", payload);
      console.log("📍 API URL:", `${API_BASE_URL}/TalkToExpert/Save`);

      const response = await fetch(`${API_BASE_URL}/TalkToExpert/Save`, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(payload)
      });
      
      console.log("📥 Talk to Expert API Response Status:", response.status);

      if (response.ok) {
        const responseText = await response.text();
        console.log("✅ Talk to Expert saved successfully:", responseText);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ Talk to Expert save failed (${response.status}):`, errorText);
        return false;
      }
    } catch (error) {
      console.error("❌ Error saving Talk to Expert:", error);
      return false;
    }
  };

  // ----------------------------------------------------------------------------
  // UI LOGIC
  // ----------------------------------------------------------------------------
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("Hi 👋 Welcome to Padhya Software Technologies!");
      setTimeout(() => {
        setStep('initial_name');
        addBotMessage("Please enter your name:");
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text, options = []) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), type: 'bot', text, options }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), type: 'user', text }]);
  };

  const toggleChat = () => {
    // Only reset if opening chat AND flow was previously completed
    if (!isOpen && step === 'flow_complete') {
      setMessages([]);
      setStep('init');
      setUserData({ name: '', phone: '' });
      setLeadId(null);
      setSelectedService(null);
      setSelectedSubService(null);
      setSelectedPlatform(null);
      setInputVal('');
    }
    setIsOpen(!isOpen);
  };

  // ----------------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------------

  // Helper helper to fetch and display subservices
  // Helper helper to fetch and display subservices
  const fetchAndShowSubServices = async (svcId, customAction = 'select_subservice') => {
      addBotMessage("......");
      const subServices = await fetchSubServices(svcId);
      setMessages(prev => prev.filter(m => m.text !== "......"));
      
      if (subServices.length > 0) {
          const subOptions = subServices.map(sub => {
              // Check if this sub-service is currently selected
              const isSelected = selectedSubService && (
                  (sub.subServiceId && sub.subServiceId === selectedSubService.subServiceId) ||
                  (sub.subService_Id && sub.subService_Id === selectedSubService.subService_Id) ||
                  (sub.id && sub.id === selectedSubService.id)
              );

              return {
                  label: sub.subServiceName || sub.subService_Name || sub.name,
                  action: customAction,
                  data: sub,
                  selected: isSelected
              };
          });

          let msgText = "Select a sub-service:";
          // Re-adding custom messages logic if previously removed/wanted
           if (svcId === 1) msgText = "We create scalable, custom-built software for businesses across multiple industries.";
           else if (svcId === 2) msgText = "We create websites in different types.";
           else if (svcId === 4) msgText = "Professional Web Design Services.";
           else if (svcId === 5) msgText = "Digital Marketing Services for your business.";
           else if (svcId === 3) msgText = "We develop mobile apps for all platforms and industries.";
           else if (svcId === 6) msgText = "Automation solutions for various industries.";

          addBotMessage(msgText, subOptions);
          setStep('subservices_list');
      } else {
          // No subservices, just finish
          finishFlow();
      }
  };

  const handleOptionClick = async (option) => {
    // Visually select the clicked option in the message history
    setMessages(prev => prev.map(msg => {
        if (msg.options && msg.options.find(o => o.label === option.label && o.data === option.data)) {
            return {
                ...msg,
                options: msg.options.map(opt => ({
                    ...opt,
                    selected: (opt.label === option.label && opt.data === option.data)
                }))
            };
        }
        return msg;
    }));

    addUserMessage(option.label);

    // Update Master Service ID if present in the option data
    if (leadId && option.data && (option.data.masterService_Id || option.data.masterServiceId)) {
        const msId = option.data.masterService_Id || option.data.masterServiceId;
        console.log("Updating ServiceMasterId:", msId);
        updateLeadPartial(leadId, { serviceMasterId: msId });
    }

    switch (option.action) {
      // --- MAIN MENU ---
      case 'menu_services':
        setStep('services_loading');
        addBotMessage("......");
        const services = await fetchServices();
        
        if (services.length > 0) {
            const serviceOptions = services.map(svc => ({
                label: svc.serviceName || svc.service_Name || svc.subServiceName || svc.subService_Name || svc.name || svc.title || "Service",
                action: 'select_service',
                data: svc
            }));
            setMessages(prev => prev.filter(m => m.text !== "......"));
            addBotMessage("Please select a service:", serviceOptions);
            setStep('services_list');
        } else {
            setMessages(prev => prev.filter(m => m.text !== "......"));
            addBotMessage("Sorry, we couldn't load services. Please try again later.");
            showMainMenu();
        }
        break;

      case 'menu_quote':
        // if (leadId) {
        //    updateLeadPartial(leadId, { action: "Get a Project Quote" });
        // }
        setStep('quote_start');
        
        // NEW FLOW: "We build tailor-made software..." -> Fetch Services
        addBotMessage("We create scalable, custom-built software for businesses across multiple industries.");
        addBotMessage("......");
        
        const qServices = await fetchServices();
        setMessages(prev => prev.filter(m => m.text !== "......"));

        if (qServices.length > 0) {
             const qsOptions = qServices.map(s => ({
                 label: s.serviceName || s.service_Name || s.name || "Service",
                 action: 'quote_select_service', // Dedicated action for Quote flow
                 data: s
             }));
             addBotMessage("Please select a project type:", qsOptions);
        } else {
             addBotMessage("Unable to load services at the moment.");
             finishFlow();
        }
        break;

      case 'menu_support':
         addBotMessage("How can we help you today?");
         addBotMessage("......");
         
         const enquiryTypes = await fetchEnquiryTypes();
         setMessages(prev => prev.filter(m => m.text !== "......"));
         
         if (enquiryTypes.length > 0) {
             const enqOptions = enquiryTypes.map(e => ({
                 label: e.enquiryTypeName || e.name || "Option",
                 action: 'select_enquiry_type',
                 data: e
             }));
             addBotMessage("Please select an issue type:", enqOptions);
         } else {
             addBotMessage("Please write your query:");
             setStep('support_desc_params'); // Fallback manual entry
         }
         break;

      case 'select_enquiry_type':
         const enqData = option.data;
         const enqId = enqData.enquiryTypeId || enqData.id;
         console.log("📋 Selected Enquiry Type:", enqData);
         console.log("📋 Enquiry Type ID:", enqId);
         setSupportData(prev => ({ ...prev, enquiryTypeId: enqId }));
         
         setStep('support_desc');
         addBotMessage("Please provide a short description of your issue:");
         break;

      case 'menu_expert':
        // Update Lead action
        if (leadId) {
            updateLeadPartial(leadId, { action: "Thank you! Our expert will contact you within 8 hours." });
        }
        
        // Start collecting expert consultation data
        // Use the name from userData if available
        if (userData.name) {
            setExpertData(prev => ({ ...prev, name: userData.name }));
        }
        
        setStep('expert_contact');
        addBotMessage("Please enter your Email:");
        break;

      case 'service_expert':
        // Talk to Expert from Services Information flow - only show message
        if (leadId) {
            updateLeadPartial(leadId, { action: "Thank you! our expert will contact you within 8 hours." });
        }
        addBotMessage("Thank you! our expert will contact you within 8 hours.");
        setStep('flow_complete');
        break;

      case 'support_final_submit':
        if (leadId) {
            updateLeadPartial(leadId, { action: "Request Submitted" });
        }
        addBotMessage("Thank you! Your request has been successfully submitted.");
        setStep('flow_complete');
        break;

      case 'end_msg':
        addBotMessage("Thank you for contacting us. Our team will reach out shortly.");
        showMainMenu();
        break;

      case 'back_to_subservice':
          if (selectedService) {
              const svcId = selectedService.id || selectedService.serviceId || selectedService.service_Id; 
              fetchAndShowSubServices(svcId);
          } else {
              showMainMenu();
          }
          break;

      // --- SERVICE FLOW ---
      case 'select_service':
      case 'select_master_service': 
        const svcData = option.data;
        // Support various ID fields (MasterService or regular Service)
        const svcId = svcData.id || svcData.masterServiceId || svcData.masterService_Id || svcData.serviceId || svcData.service_Id;
        setSelectedService(svcData);
        
        // Update Lead with ServiceID
        if (leadId) {
            await updateLeadPartial(leadId, { service: svcId });
        }

        // SPECIAL FLOW for Mobile (3) and Automation (6): Service -> Platform -> SubService
        if (svcId === 3 || svcId === 6) {
             addBotMessage("......");
             const platforms = await fetchPlatformOptions(svcId);
             setMessages(prev => prev.filter(m => m.text !== "......"));
             
             if (platforms.length > 0) {
                 const platOptions = platforms.map(p => ({
                     label: p.platformoptionsName || p.platformName || p.name,
                     action: 'select_platform',
                     data: p
                 }));
                 addBotMessage("Please select a platform:", platOptions);
                 setStep('platform_list');
             } else {
                 // Fallback if no platforms found: try SubServices
                 fetchAndShowSubServices(svcId);
             }
        } 
        // STANDARD FLOW: Service -> SubService
        else {
             fetchAndShowSubServices(svcId);
        }
        break;

      case 'select_platform':
        const platData = option.data;
        const platId = platData.platformoptionsId || platData.id;
        setSelectedPlatform(platData);
        
        // Update Lead with PlatformOption
        if (leadId) {
            await updateLeadPartial(leadId, { platformOpation: platId });
        }
        
        // After Platform, fetch SubServices for the selected SERVICE
        const currentServiceId = selectedService?.id || selectedService?.serviceId || selectedService?.service_Id;
        if (currentServiceId) {
            fetchAndShowSubServices(currentServiceId);
        } else {
            finishFlow();
        }
        break;

      case 'select_subservice':
        const subData = option.data;
        const subId = subData.subServiceId || subData.subService_Id || subData.id;
        setSelectedSubService(subData);
        
        // Update Lead with SubServiceID
        if (leadId) {
            await updateLeadPartial(leadId, { subService: subId });
        }

        // For standard flow, we might check platform after. 
        // For special flow (3/6), we just came from platform, so we are done.
        finishFlow();
        break;

      // --- DEDICATED QUOTE FLOW HANDLERS ---
      
      case 'quote_select_service':
        const qSvcData = option.data;
        const qSvcId = qSvcData.id || qSvcData.serviceId || qSvcData.service_Id;
        setSelectedService(qSvcData);

        if (leadId) {
            await updateLeadPartial(leadId, { service: qSvcId });
        }
        
        // Logic: Platform options ONLY for Mobile (3) and Automation (6)
        if (qSvcId === 3 || qSvcId === 6) {
            addBotMessage("......");
            const qSvcPlatforms = await fetchPlatformOptions(qSvcId);
            setMessages(prev => prev.filter(m => m.text !== "......"));

            if (qSvcPlatforms.length > 0) {
                 const qPlatOptions = qSvcPlatforms.map(p => ({
                     label: p.platformoptionsName || p.platformName || p.name,
                     action: 'quote_special_platform',
                     data: p
                 }));
                 addBotMessage("Please select a platform:", qPlatOptions);
                 setStep('platform_list');
            } else {
                 // Fallback: SubServices -> Details
                 fetchAndShowSubServices(qSvcId, 'quote_special_subservice');
            }
        } 
        else {
            // Other Services: SubServices -> Details
            fetchAndShowSubServices(qSvcId, 'quote_special_subservice');
        }
        break;



      // --- SPECIAL QUOTE FLOW: Platform -> SubService ---
      case 'quote_special_platform':
         const qsPlatData = option.data;
         const qsPlatId = qsPlatData.platformoptionsId || qsPlatData.id;
         setSelectedPlatform(qsPlatData);
         
         if (leadId) {
             await updateLeadPartial(leadId, { platformOpation: qsPlatId });
         }

         // Fetch SubServices using PLATFORM ID (as per requirement for 3/6)
         fetchAndShowSubServices(qsPlatId, 'quote_special_subservice');
         break;

      case 'quote_special_subservice':
         const qsSubData = option.data;
         const qsSubId = qsSubData.subServiceId || qsSubData.subService_Id || qsSubData.id;
         setSelectedSubService(qsSubData);
         
         if (leadId) {
             await updateLeadPartial(leadId, { subService: qsSubId });
         }
         startProjectDetailsCollection();
         break;
         
      case 'select_budget':
          const budgetVal = option.data;
          setProjectData(prev => ({ ...prev, budget: budgetVal }));
          // Ask for Timeline next
          setStep('quote_timeline');
          addBotMessage("What is your expected timeline for this project?");
          break;

      case 'select_followup_call':
          if (leadId) {
             await updateLeadPartial(leadId, { followUp: "Thank you! We have received your request and will call you shortly." });
          }
          addBotMessage("Thank you! We have received your request and will call you shortly.");
        setStep('flow_complete');
        break;

      case 'select_followup_meeting':
          setStep('followup_time_input');
          addBotMessage("Please enter your preferred date and time for the meeting:");
          break;

      case 'show_main_menu':
        showMainMenu();
        break;
        
      default:
        showMainMenu();
        break;
    }
  };

  const checkPlatformAndFinish = async (serviceId, subServiceId) => {
      // (This function seems unused in new flows but keeping for safety if referenced else where)
      // If not ID 3/6 or no platforms found, finish
      finishFlow();
  };
  
  const startProjectDetailsCollection = () => {
      setStep('quote_project_name');
      addBotMessage("Great! Please provide your Project Name:");
  };

  const finishFlow = () => {
      addBotMessage("Great! We have recorded your preferences.", [
          { label: "Talk to Expert", action: "service_expert" },
          { label: "Back to Menu", action: "back_to_subservice" }
      ]);
      setStep('flow_complete');
  };

  const showMainMenu = async () => {
      setStep('main_menu');
      addBotMessage("......");
      
      const masterServices = await fetchMasterServices();
      setMessages(prev => prev.filter(m => m.text !== "......"));

      if (masterServices.length > 0) {
          const menuOptions = masterServices.map(ms => {
              // Map API items to local actions based on ID or Name
              let act = 'select_master_service'; // Default
              
              const nameLower = (ms.masterService_Name || "").toLowerCase();

              // Logic mapping based on observed IDs and Names
              if (ms.masterService_Id === 1 || nameLower.includes("services")) {
                  act = 'menu_services';
              } else if (ms.masterService_Id === 2 || nameLower.includes("quote")) {
                  act = 'menu_quote';
              } else if (ms.masterService_Id === 3 || nameLower.includes("support")) {
                  act = 'menu_support';
              } else if (ms.masterService_Id === 4 || nameLower.includes("expert") || nameLower.includes("representative")) {
                  act = 'menu_expert';
              }

              return {
                label: ms.masterService_Name || ms.name || "Option",
                action: act,
                data: ms
              };
          });
          addBotMessage("How can we help you today?", menuOptions);
      } else {
          // Fallback if API fails
          console.warn("Master Services API returned empty. Showing default menu.");
          addBotMessage("How can we help you today?", [
              { label: "Services Information", action: "menu_services" },
              { label: "Get a Project Quote", action: "menu_quote" },
              { label: "Support / Contact", action: "menu_support" },
              { label: "Talk to Expert", action: "menu_expert" }
          ]);
      }
  };

  const handleInputSubmit = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    let value = inputVal.trim();
    
    // 1. Phone Validation
    if (step === 'initial_phone' || step === 'capturing_phone') {
        // Enforce exactly 10 digits
        if (!/^\d{10}$/.test(value)) {
            addBotMessage("Please enter a valid 10-digit phone number.");
            return;
        }
    }

    addUserMessage(value);
    setInputVal('');

    if (step === 'initial_name') {
        setUserData(prev => ({ ...prev, name: value }));
        setStep('initial_phone');
        addBotMessage(`Thanks ${value}! Now, please enter your Phone Number:`);
    }
    else if (step === 'initial_phone') {
        setUserData(prev => ({ ...prev, phone: value }));
        
        addBotMessage("......");
        const id = await saveLead(userData.name, value);
        setMessages(prev => prev.filter(m => m.text !== "......"));
        
        if (id) {
           showMainMenu();
        } else {
           addBotMessage("We faced an issue saving your details, but let's continue.");
           showMainMenu();
        }
    }
    else if (step === 'quote_start') {
        addBotMessage("Thank you. We will get back to you with a quote.");
        showMainMenu();
    }
    else if (step === 'quote_project_name') {
        setProjectData(prev => ({ ...prev, projectName: value }));
        setStep('quote_project_desc');
        addBotMessage("Please describe your project in a few words:");
    }
    else if (step === 'quote_project_desc') {
        setProjectData(prev => ({ ...prev, projectDescription: value }));
        // Ask for Budget with options
        const budgetOptions = [
            { label: "20,000 - 30,000", action: "select_budget", data: "20000-30000" },
            { label: "30,000 - 40,000", action: "select_budget", data: "30000-40000" },
            { label: "40,000 - 50,000", action: "select_budget", data: "40000-50000" },
            { label: "50,000+", action: "select_budget", data: "50000+" }
        ];
        addBotMessage("What is your estimated budget?", budgetOptions);
        setStep('quote_budget'); // Waiting for option click
    }
    else if (step === 'quote_timeline') {
        // Save Project Data
        const finalData = { ...projectData, timeline: value };
        setProjectData(finalData);
        
        addBotMessage("......");
        await saveProjectQuote(finalData);
        setMessages(prev => prev.filter(m => m.text !== "......"));
        
        // Ask for Follow Up
        addBotMessage("How would you like to proceed?", [
            { label: "Call Me", action: "select_followup_call" },
            { label: "Schedule Meeting", action: "select_followup_meeting" }
        ]);
        setStep('waiting_for_followup');
    }
    else if (step === 'support_desc') {
        console.log("📝 Support Description entered:", value);
        setSupportData(prev => ({ ...prev, description: value }));
        setStep('support_contact');
        addBotMessage("Please enter your Email:");
    }
    else if (step === 'support_contact') {
        const isPhone = /^\d+$/.test(value);
        if (isPhone) {
            if (value.length !== 10) {
                addBotMessage("Please enter a valid 10-digit phone number.");
                return;
            }
        } else {
             // Treat as email - Clean & Validate
             value = value.trim().replace(/\s/g, '').toLowerCase();

             // Strict Regex: user@domain.tld
             const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
             
             if (!emailRegex.test(value)) {
                 addBotMessage("Please enter a valid email address (e.g. user@domain.com).");
                 return;
             }
             
             // --- EXTRA STRICT DOMAIN CHECKS ---
             const domain = value.split('@')[1];
             const domainName = domain.split('.')[0];
             const tld = domain.split('.').pop();
             
             // 1. Block common Gmail/Google typos
             // Catches: gamil, gnail, gmial, gamill, gamilll, gmaill, etc.
             const gmailTypos = ['gamil', 'gnail', 'gmial', 'gmaill', 'gamill', 'gamilll', 'gimail', 'gmal', 'gmai'];
             if (gmailTypos.includes(domainName) || (domainName.startsWith('g') && domainName.endsWith('l') && domainName.includes('m') && domainName !== 'gmail' && domainName !== 'googlemail')) {
                  addBotMessage(`Did you mean @gmail.com? You entered @${domain}`);
                  return;
             }

             // 2. Block suspicious TLDs for common providers (e.g. gmail.co, yahoo.co which are usually typos for .com)
             const commonComProviders = ['gmail', 'yahoo', 'hotmail', 'outlook', 'rediffmail'];
             if (commonComProviders.includes(domainName)) {
                 if (tld === 'co' || tld === 'con' || tld === 'comm' || tld === 'c' || tld === 'cm') {
                     addBotMessage(`Did you mean .com? You entered .${tld}`);
                     return;
                 }
             }

             // 3. Catch generic extension typos
             if (tld === 'c' || tld === 'comm' || tld === 'con') {
                 addBotMessage(`Please check your domain extension (.com).`);
                 return;
             }
        }

        const finalSupportData = { ...supportData, contactInfo: value };
        setSupportData(finalSupportData);
        
        console.log("📊 Final Support Data:", finalSupportData);
        console.log("🆔 Current Lead ID:", leadId);
        
        addBotMessage("......");
        
        // Save to SupportContactFlow table
        const saveSuccess = await saveSupportContact(finalSupportData);
        
        // Also update the Lead 'action' column as requested
        if (leadId) {
            await updateLeadPartial(leadId, { action: "Support Request Submitted" });
        }

        setMessages(prev => prev.filter(m => m.text !== "......"));
        
        if (saveSuccess) {
            // Custom finish for Support flow: "Talk to Expert" and "Submit"
            addBotMessage("Great! We have recorded your preferences.", [
                { label: "Talk to Expert", action: "service_expert" },
                { label: "Submit", action: "support_final_submit" }
            ]);
        } else {
            addBotMessage("There was an issue saving your request. Please check the console for details.", [
                { label: "Try Again", action: "menu_support" },
                { label: "Talk to Expert", action: "service_expert" }
            ]);
        }
        setStep('flow_complete');
    }
    else if (step === 'followup_time_input') {
        const meetingTime = value;
        if (leadId) {
             // Saving 'Schedule Meeting' plus the time as the followUp status/note
             await updateLeadPartial(leadId, { followUp: `Schedule Meeting: ${meetingTime}` });
        }
        addBotMessage("Thank you! Your meeting request has been noted.");
        setStep('flow_complete');
    }
    else if (step === 'expert_contact') {
        const isPhone = /^\d+$/.test(value);
        
        if (isPhone) {
            if (value.length !== 10) {
                addBotMessage("Please enter a valid 10-digit phone number.");
                return;
            }
        } else {
             // Treat as email - Clean & Validate
             value = value.trim().replace(/\s/g, '').toLowerCase();

             const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
             if (!emailRegex.test(value)) {
                  addBotMessage("Please enter a valid email address (e.g. user@domain.com) or 10-digit phone number.");
                  return;
             }
             
             // --- EXTRA STRICT DOMAIN CHECKS ---
             const domain = value.split('@')[1];
             const domainName = domain.split('.')[0];
             const tld = domain.split('.').pop();
             
             const gmailTypos = ['gamil', 'gnail', 'gmial', 'gmaill', 'gamill', 'gamilll', 'gimail', 'gmal', 'gmai'];
             if (gmailTypos.includes(domainName) || (domainName.startsWith('g') && domainName.endsWith('l') && domainName.includes('m') && domainName !== 'gmail' && domainName !== 'googlemail')) {
                  addBotMessage(`Did you mean @gmail.com? You entered @${domain}`);
                  return;
             }

             const commonComProviders = ['gmail', 'yahoo', 'hotmail', 'outlook', 'rediffmail'];
             if (commonComProviders.includes(domainName)) {
                 if (tld === 'co' || tld === 'con' || tld === 'comm' || tld === 'c' || tld === 'cm') {
                     addBotMessage(`Did you mean .com? You entered .${tld}`);
                     return;
                 }
             }
             
             if (tld === 'c' || tld === 'comm' || tld === 'con') {
                 addBotMessage(`Please check your domain extension (.com).`);
                 return;
             }
        }
        
        console.log("📞 Expert Contact entered:", value);
        setExpertData(prev => ({ ...prev, contact: value }));
        setStep('expert_call_time');
        addBotMessage("When would you prefer our expert to call you?");
    }
    else if (step === 'expert_call_time') {
        const finalExpertData = { 
            ...expertData, 
            preferredCallTime: value,
            name: expertData.name || userData.name || 'User'
        };
        setExpertData(finalExpertData);
        
        console.log("📊 Final Expert Data:", finalExpertData);
        console.log("🆔 Current Lead ID:", leadId);
        
        addBotMessage("......");
        
        // Save to TalkToExpert API
        const saveSuccess = await saveTalkToExpert(finalExpertData);
        
        setMessages(prev => prev.filter(m => m.text !== "......"));
        
        if (saveSuccess) {
            addBotMessage("Thank you! our expert will contact you within 8 hours.");
        } else {
            addBotMessage("There was an issue saving your request. Please check the console for details.");
        }
        setStep('flow_complete');
    }
  };
  
  const handleInputChange = (e) => {
    let val = e.target.value;
    
    // Strict input filtering for Phone specific steps
    if (step === 'initial_phone') {
        // ONLY allow digits. Replace anything that is not a digit with empty string.
        val = val.replace(/\D/g, '');
        // Limit to 10
        if (val.length > 10) val = val.slice(0, 10);
    } 
    else if (step === 'expert_contact' || step === 'support_contact') {
        // These fields accept EITHER phone OR email.
        const isNumeric = /^\d+$/.test(val);
        if (isNumeric) {
             if (val.length > 10) val = val.slice(0, 10);
        }
    }
    setInputVal(val);
  };
  return (
    <div className="fcb-wrapper">
      <div className={`fcb-window ${isOpen ? 'open' : ''}`}>
        <div className="fcb-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="./img/image.png" 
              alt="Padhyasoft Logo" 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%',
                objectFit: 'cover',
                backgroundColor: '#f0e7e7ff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <div>
              <div className="fcb-title">PadhyaSoft Smart Assistant</div>
              <div className="fcb-subtitle">Online</div>
            </div>
          </div>
          <button className="fcb-close" onClick={toggleChat}>
             <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="fcb-body">
          {messages.map((msg) => (
            <div key={msg.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: msg.type === 'bot' ? 'flex-start' : 'flex-end' }}>
              <div className={`fcb-message ${msg.type}`}>
                {msg.text === "......" ? (
                  <div className="fcb-loading-dots">
                    <span className="fcb-dot"></span>
                    <span className="fcb-dot"></span>
                    <span className="fcb-dot"></span>
                    <span className="fcb-dot"></span>
                    <span className="fcb-dot"></span>
                    <span className="fcb-dot"></span>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
              {msg.options && msg.options.length > 0 && (
                <div className="fcb-options">
                  {msg.options.map((opt, idx) => (
                    <button 
                      key={idx} 
                      className="fcb-option-btn"
                      onClick={() => handleOptionClick(opt)}
                      style={opt.selected ? { backgroundColor: '#384bff', color: '#fff', borderColor: '#384bff' } : {}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="fcb-input-area">
            <form className="fcb-form" onSubmit={handleInputSubmit}>
                  <input
                    type={step === 'initial_phone' ? "tel" : "text"}
                    className="fcb-input"
                    value={inputVal}
                    onChange={handleInputChange}
                    placeholder={step === 'initial_phone' ? "Enter 10-digit number..." : "Type here..."}
                    // Disable input during option selection steps to prevent confusion
                    disabled={['services_list', 'subservices_list', 'platform_list'].includes(step)}
                  />
                  <button type="submit" className="fcb-submit-btn">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
            </form>
        </div>
      </div>

      <button className="fcb-toggle" onClick={toggleChat}>
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        )}
      </button>
    </div>
  );
};

export default FloatingChatbox;
