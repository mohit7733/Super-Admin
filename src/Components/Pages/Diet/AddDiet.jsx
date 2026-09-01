import { useEffect, useState } from "react";
import {
  Apple,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Coffee,
  Info,
  Moon,
  Plus,
  Sun,
  Trash2,
   UploadCloud,
  Utensils,
  X,
} from "lucide-react";

import "./AddDiet.css";
import BASE_URL from "../../../Base";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const mealTypes = [
  {
    name: "Morning",
    tone: "morning",
    icon: Sun,
  },
  {
    name: "Breakfast",
    tone: "breakfast",
    icon: Coffee,
  },
  {
    name: "Midday",
    tone: "midday",
    icon: Apple,
  },
  {
    name: "Lunch",
    tone: "lunch",
    icon: Utensils,
  },
  {
    name: "Dinner",
    tone: "dinner",
    icon: Moon,
  },
];

const initialForm = {
  name: "",
  prakriti: "",
  season: "",
  is_paid: false,
  price: 0,
  is_common: true,
  description: "",
  notes: "",
   guidance: [],
};
const createEmptyMeal = (dayNumber, index) => {
  const meal = mealTypes[index % mealTypes.length];

  return {
    id: `day-${dayNumber}-meal-${index}-${Date.now()}`,
    name: meal.name,
    tone: meal.tone,
    icon: meal.icon,

    diet: [
      {
        id: `item-${Date.now()}`,
        name: "",
        quantity: "",
        notes: "",
      },
    ],
    diet_gallery: [],
    recipe: [""],

  guidance: [],

    steps: "",
    calories: "",
    carbs: "",
    protein: "",
    fat: "",


    
  };
};

const createMealsForDay = (dayNumber) => {
  return mealTypes.map((_, index) =>
    createEmptyMeal(dayNumber, index)
  );
};





export default function Page() {
  

 
    const [dietImage, setDietImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);
const [formData, setFormData] = useState(initialForm);



  const [isSubmitting, setIsSubmitting] = useState(false);

  const [days, setDays] = useState([1]);



   
    const[DiseaseData,setDiseaseData]=useState([]);
    const[PrakirtiData,setPrakirtiData]=useState([]);
    const[DietData,setDietData]=useState([]);
    const[DiseaseError,setDiseaseError]=useState(null);
    const[DiseaseLoading,setDiseaseLoading]=useState(false);
    const[PrakirtiError,setPrakirtiError]=useState(null);
    const[PrakirtiLoading,setPrakirtiLoading]=useState(false);
    const[DietLoading,setDietLoading]=useState(false);
    const[DietError,setDietError]=useState(null);
    const [selectedDiseases, setSelectedDiseases] = useState([]);

const [diseaseDropdownOpen, setDiseaseDropdownOpen] = useState(false);

  
  

  const [isActive, setIsActive] =
    useState(true);



  const [dayMeals, setDayMeals] = useState({
    1: createMealsForDay(1),
  });
 const handleImageChange = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }


    if (
      file.size >
      2 * 1024 * 1024
    ) {
      alert(
        "Image size must be less than 2MB."
      );

      return;
    }

    setDietImage(file);

    const reader =
      new FileReader();

    reader.onloadend = () => {
      setImagePreview(
        reader.result
      );
    };

    reader.readAsDataURL(file);
  };
    const removeImage = () => {

    setDietImage(null);

    setImagePreview(null);
  };

 
  const addDay = () => {
 
    if (days.length >= 7) {
      return;
    }

   
    const newDay =
      days.length === 0
        ? 1
        : Math.max(...days) + 1;

   

    setDays((previousDays) => [
      ...previousDays,
      newDay,
    ]);

 
    setDayMeals((previousMeals) => ({
      ...previousMeals,

      [newDay]:
        createMealsForDay(newDay),
    }));
  };


 
  const deleteDay = (dayNumber) => {
   
    if (dayNumber === 1) {
      return;
    }

   
    setDays((previousDays) =>
      previousDays.filter(
        (day) => day !== dayNumber
      )
    );

    

    setDayMeals((previousMeals) => {
      const updatedMeals = {
        ...previousMeals,
      };

      delete updatedMeals[dayNumber];

      return updatedMeals;
    });
  };

  

  const addMeal = (dayNumber) => {
    setDayMeals((previousMeals) => {
      const currentMeals =
        previousMeals[dayNumber] || [];

      const newMeal = createEmptyMeal(
        dayNumber,
        currentMeals.length
      );

      return {
        ...previousMeals,

        [dayNumber]: [
          ...currentMeals,
          newMeal,
        ],
      };
    });
  };



  const removeMeal = (
    dayNumber,
    mealId
  ) => {
    setDayMeals((previousMeals) => ({
      ...previousMeals,

      [dayNumber]: (
        previousMeals[dayNumber] || []
      ).filter(
        (meal) => meal.id !== mealId
      ),
    }));
  };
  const addDietItem = (dayNumber, mealId) => {
  setDayMeals((previousMeals) => ({
    ...previousMeals,
    [dayNumber]: (previousMeals[dayNumber] || []).map((meal) => {
      if (meal.id !== mealId) return meal;

      return {
        ...meal,
        diet: [
          ...(meal.diet || []),
          {
            id: `item-${Date.now()}-${Math.random()}`,
            name: "",
            quantity: "",
            notes: "",
          },
        ],
      };
    }),
  }));
};

const removeDietItem = (dayNumber, mealId, itemId) => {
  setDayMeals((previousMeals) => ({
    ...previousMeals,
    [dayNumber]: (previousMeals[dayNumber] || []).map((meal) => {
      if (meal.id !== mealId) return meal;

      return {
        ...meal,
        diet: (meal.diet || []).filter(
          (item) => item.id !== itemId
        ),
      };
    }),
  }));
};

const updateDietItem = (
  dayNumber,
  mealId,
  itemId,
  field,
  value
) => {
  setDayMeals((previousMeals) => ({
    ...previousMeals,
    [dayNumber]: (previousMeals[dayNumber] || []).map((meal) => {
      if (meal.id !== mealId) return meal;

      return {
        ...meal,
        diet: (meal.diet || []).map((item) =>
          item.id === itemId
            ? {
                ...item,
                [field]: value,
              }
            : item
        ),
      };
    }),
  }));
};

const updateMealField = (
  dayNumber,
  mealId,
  field,
  value
) => {
  setDayMeals((previousMeals) => ({
    ...previousMeals,
    [dayNumber]: (previousMeals[dayNumber] || []).map((meal) =>
      meal.id === mealId
        ? {
            ...meal,
            [field]: value,
          }
        : meal
    ),
  }));
};
const handleMealGalleryChange = (
  dayNumber,
  mealId,
  file
) => {
  if (!file) return;

  
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Meal image must be less than 5MB.");
    return;
  }

  if (!file.type.startsWith("image/")) {
    toast.error("Please select a valid image.");
    return;
  }

  const imageUrl = URL.createObjectURL(file);

  setDayMeals((previousMeals) => ({
    ...previousMeals,

    [dayNumber]: (previousMeals[dayNumber] || []).map(
      (meal) =>
        meal.id === mealId
          ? {
              ...meal,

              diet_gallery: [
                ...(meal.diet_gallery || []),
                {
                  file,
                  image_url: imageUrl,
                  caption: "",
                },
              ],
            }
          : meal
    ),
  }));
};
const removeMealGalleryImage = (
  dayNumber,
  mealId,
  galleryIndex
) => {
  setDayMeals((previousMeals) => ({
    ...previousMeals,

    [dayNumber]: (previousMeals[dayNumber] || []).map(
      (meal) =>
        meal.id === mealId
          ? {
              ...meal,
              diet_gallery: (
                meal.diet_gallery || []
              ).filter(
                (_, index) => index !== galleryIndex
              ),
            }
          : meal
    ),
  }));
};
const updateMealGalleryCaption = (
  dayNumber,
  mealId,
  galleryIndex,
  value
) => {
  setDayMeals((previousMeals) => ({
    ...previousMeals,

    [dayNumber]: (previousMeals[dayNumber] || []).map(
      (meal) =>
        meal.id === mealId
          ? {
              ...meal,

              diet_gallery: (
                meal.diet_gallery || []
              ).map((image, index) =>
                index === galleryIndex
                  ? {
                      ...image,
                      caption: value,
                    }
                  : image
              ),
            }
          : meal
    ),
  }));
};
const addDietPlan = async () => {
  try {
    setIsSubmitting(true);

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

  
    const schedule = {};

    Object.keys(dayMeals).forEach((dayNumber) => {
      const meals = dayMeals[dayNumber] || [];

      const dayKey = `day_${dayNumber}`;

      schedule[dayKey] = {};

      meals.forEach((meal) => {
        // Convert "Morning" -> "morning"
        const mealKey = meal.name.toLowerCase();

        schedule[dayKey][mealKey] = {
          diet: (meal.diet || []).map((item) => ({
            name: item.name,
            quantity: item.quantity,
            notes: item.notes,
          })),
  recipe: (meal.recipe || []).filter(Boolean),
          preparation_steps: meal.steps
            ? meal.steps
                .split("\n")
                .map((step) => step.trim())
                .filter(Boolean)
            : [],


          nutrition: {
            total_calories: {
              value: Number(meal.calories) || 0,
              unit: "kcal",
            },

            carbs: {
              value: Number(meal.carbs) || 0,
              unit: "g",
            },

            protein: {
              value: Number(meal.protein) || 0,
              unit: "g",
            },

            fat: {
              value: Number(meal.fat) || 0,
              unit: "g",
            },
          },
        };
      });
    });

  
    const dietPlanGallery = [];

    if (dietImage) {
     
      dietPlanGallery.push({
        image_url: imagePreview || "",
        is_cover: true,
        caption: `${formData.name} Cover`,
      });
    }

    
    const payload = {
      name: formData.name,

      prakriti: formData.prakriti,
      guidance: formData.guidance,

      season: formData.season,

      health_diseases: DiseaseData
        .filter((disease) =>
          selectedDiseases.includes(disease.id)
        )
        .map((disease) => ({
          id: disease.id,
          name: disease.name,
        })),

      is_paid: formData.is_paid,

      price: formData.is_paid
        ? Number(formData.price) || 0
        : 0,

      is_common: formData.is_common,

      diet_plan_gallery: dietPlanGallery,

      schedule,

      description: formData.description,

      notes: formData.notes,

      is_active: isActive,
    };

    console.log("POST DIET PAYLOAD:", payload);

    const response = await fetch(
      `${BASE_URL}/diet/plans/`,
      {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },

        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log("ADD DIET RESPONSE:", data);

    if (response.ok) {
      toast.success(
        data?.message || "Diet plan created successfully!"
      );

      // Optional reset
      setFormData(initialForm);
      setSelectedDiseases([]);
      setDietImage(null);
      setImagePreview(null);
      setDays([1]);
      setDayMeals({
        1: createMealsForDay(1),
      });
      setIsActive(true);
    } else {
      toast.error(
        data?.message ||
          data?.detail ||
          "Failed to create diet plan."
      );
    }
  } catch (error) {
    console.error("ADD DIET ERROR:", error);

    toast.error(
      "Something went wrong while creating diet plan."
    );
  } finally {
    setIsSubmitting(false);
  }
};
  const handleDiseaseChange = (diseaseId) => {
  setSelectedDiseases((prev) =>
    prev.includes(diseaseId)
      ? prev.filter((id) => id !== diseaseId)
      : [...prev, diseaseId]
  );
};
  const fetchPrakritiAnalysis = async () => {
  try {
    setPrakirtiLoading(true);

    const token = sessionStorage.getItem("superadmin_token");

    const response = await fetch(
      `${BASE_URL}/customers/prakriti/admin/analysis-contents/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
setPrakirtiData(data?.data || []);
    } else {
      toast.error(data?.message || "Failed to fetch Prakriti analysis");
    }
  } catch (error) {
    console.log(error);
    toast.error("Something went wrong");
  } finally {
    setPrakirtiLoading(false);
  }
};

const fetchHealthDiseases = async () => {
  try {
    setDiseaseLoading(true);

    const token = sessionStorage.getItem("superadmin_token");

    const response = await fetch(
      `${BASE_URL}/user/admin/health-disease/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
setDiseaseData(data?.data?.results || []);
    } else {
      toast.error(
        data?.message || "Failed to fetch health diseases"
      );
    }
  } catch (error) {
    console.log(error);
    toast.error("Something went wrong");
  } finally {
    setDiseaseLoading(false);
  }
};



useEffect(()=>{
  fetchPrakritiAnalysis();
  fetchHealthDiseases();
},[])
  return (
    <div className="page-header">

  

      <header className="page-heading">
        <div>

          <h1>
            Add Diet Plan
          </h1>

          <p>
            Create a new diet plan with meal
            schedule and nutrition details.
          </p>

        </div>
      </header>

    

      <section className="panels">

        <SectionTitle
          icon={
            <ClipboardList size={18} />
          }
          title="Basic Details"
        />

        <div className="form-grid three">

     

          <label>
            Diet Plan Name <em>*</em>

           <input
  type="text"
  placeholder="Enter diet plan name"
  value={formData.name}
  onChange={(e) =>
    setFormData({
      ...formData,
      name: e.target.value,
    })
  }
/>
          </label>

         

<label>
  Prakriti <em>*</em>

  <select
    value={formData.prakriti}
    onChange={(e) =>
      setFormData({
        ...formData,
        prakriti: e.target.value,
      })
    }
  >
    <option value="">
      Select Prakriti
    </option>

    {PrakirtiData.map((item) => (
      <option
        key={item.id}
        value={item.prakriti_type}
      >
        {item.prakriti_type}
      </option>
    ))}
  </select>
</label>



      <label>
  Season <em>*</em>

  <select
    value={formData.season}
    onChange={(e) =>
      setFormData({
        ...formData,
        season: e.target.value,
      })
    }
  >
    <option value="" disabled>
      Select season
    </option>

    <option value="summer">
      Summer
    </option>

    <option value="winter">
      Winter
    </option>

    <option value="monsoon">
      Monsoon
    </option>
  </select>
</label>

<label className="disease-dropdown-wrapper">
Select Disease
<div className="multi-select">

  <div
    className="multi-select-header"
    onClick={() =>
      setDiseaseDropdownOpen(!diseaseDropdownOpen)
    }
  >
    {selectedDiseases.length > 0
      ? DiseaseData
          .filter((item) =>
            selectedDiseases.includes(item.id)
          )
          .map((item) => item.name)
          .join(", ")
      : "Select Diseases"}
  </div>

  {diseaseDropdownOpen && (
    <div className="multi-select-dropdown">

      {DiseaseLoading ? (
        <div>Loading diseases...</div>
      ) : (
        DiseaseData
          .filter((item) => item.is_active)
          .map((item) => (
            <label
              key={item.id}
              className="checkbox-option"
            >
              <input
                type="checkbox"
                checked={selectedDiseases.includes(item.id)}
                onChange={() =>
                  handleDiseaseChange(item.id)
                }
              />

              <span>{item.name}</span>
            </label>
          ))
      )}

    </div>
  )}

</div>
</label>


    <fieldset>
  <legend>
    Is Paid?
  </legend>

  <div className="radio-row">

    <label>
      <input
        type="radio"
        name="paid"
        checked={formData.is_paid === true}
        onChange={() =>
          setFormData({
            ...formData,
            is_paid: true,
          })
        }
      />
      Yes
    </label>

    <label>
      <input
        type="radio"
        name="paid"
        checked={formData.is_paid === false}
        onChange={() =>
          setFormData({
            ...formData,
            is_paid: false,
            price: 0,
          })
        }
      />
      No
    </label>

  </div>
</fieldset>

      
<fieldset>
  <legend>
    Is Common?
  </legend>

  <div className="radio-row">

    <label>
      <input
        type="radio"
        name="common"
        checked={formData.is_common === true}
        onChange={() =>
          setFormData({
            ...formData,
            is_common: true,
          })
        }
      />
      Yes
    </label>

    <label>
      <input
        type="radio"
        name="common"
        checked={formData.is_common === false}
        onChange={() =>
          setFormData({
            ...formData,
            is_common: false,
          })
        }
      />
      No
    </label>

  </div>
</fieldset>

          {/* Price */}

        {formData.is_paid && (
  <label>
    Price (₹)

    <input
      type="number"
      min="0"
      placeholder="0.00"
      value={formData.price}
      onChange={(e) =>
        setFormData({
          ...formData,
          price: e.target.value,
        })
      }
    />
  </label>
)}

<label className="guidance-field">
  Guidance

  <textarea
    placeholder="Enter guidance for this diet plan"
    value={(formData.guidance || []).join("\n")}
    onChange={(e) => {
      const guidance = e.target.value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      setFormData({
        ...formData,
        guidance,
      });
    }}
  />
</label>

        </div>
      </section>

      {/* ===================================================
          DIET SCHEDULE
      =================================================== */}

      <section className="panels schedule-panels">

        <SectionTitle
          icon={
            <CalendarDays size={18} />
          }
          title="Diet Schedule"
          subtitle="Add meals for each day. You can add up to 7 days."
        />

     
<div className="day-controls">

  <div></div>

  <button
    className="add-day"
    type="button"
    onClick={addDay}
    disabled={days.length >= 7}
  >
    <Plus size={15} />
    Add Day
  </button>

</div>
       
        {days.map((day) => (

          <div
            className="diet-day-section"
            key={day}
          >

        
            <div className="diet-day-header">

              <h3>
                Day {day}
              </h3>

              {/* DELETE DAY */}

              {day !== 1 && (

                <button
                  type="button"
                  className="delete-day"
                  onClick={() =>
                    deleteDay(day)
                  }
                  title={`Delete Day ${day}`}
                >

                  <Trash2 size={15} />

                  Delete Day

                </button>

              )}

            </div>

           

         <div className="meal-list">
  {(dayMeals[day] || []).map((meal) => (
   <MealCard
  key={`${day}-${meal.id}`}
  meal={meal}
  dayNumber={day}
  onRemove={() => removeMeal(day, meal.id)}
  onAddDietItem={addDietItem}
  onRemoveDietItem={removeDietItem}
  onUpdateDietItem={updateDietItem}
  onUpdateMealField={updateMealField}
  onMealGalleryChange={handleMealGalleryChange}
  onRemoveMealGalleryImage={removeMealGalleryImage}
  onUpdateMealGalleryCaption={updateMealGalleryCaption}
/>
  ))}
</div>

            {/* =============================================
                ADD MEAL
            ============================================= */}

            {/* <div className="day-add-meal">

              <button
                className="add-meal"
                type="button"
                onClick={() =>
                  addMeal(day)
                }
              >

                <Plus size={16} />

                Add Meal

              </button>

            </div> */}

          </div>

        ))}

      </section>

      {/* ===================================================
          ADDITIONAL INFORMATION
      =================================================== */}

    <section className="panels">
  <SectionTitle
    icon={<Info size={18} />}
    title="Additional Information"
  />

  <div className="form-grid two">
    {/* Description */}
    <label>
      Description
      <textarea
  placeholder="Enter diet plan description (optional)"
  value={formData.description}
  onChange={(e) =>
    setFormData({
      ...formData,
      description: e.target.value,
    })
  }
/>
    </label>

    {/* Notes */}
    <label>
      Notes / Tips
      <textarea
  placeholder="Enter any notes or tips for this diet plan (optional)"
  value={formData.notes}
  onChange={(e) =>
    setFormData({
      ...formData,
      notes: e.target.value,
    })
  }
/>
    </label>
  </div>

  <div className="diet-bottom-row">
    
    <div className="diet-image-section">
      <label className="bottom-field-label">
        Diet Plan Image <span>(Optional)</span>
      </label>

      <label className="image-upload-box">
        <input
          type="file"
          accept=".svg,.png,.jpg,.jpeg,.gif"
          onChange={handleImageChange}
        />

        <div className="upload-icon">
          <UploadCloud size={20} />
        </div>

        <div className="upload-content">
          <strong>
            {dietImage
              ? dietImage.name
              : "Click to upload or drag and drop"}
          </strong>

          <small>
            SVG, PNG, JPG or GIF (Max. 2MB)
          </small>
        </div>
      </label>

      {/* IMAGE PREVIEW */}
      {imagePreview && (
        <div className="image-preview">
          <img
            src={imagePreview}
            alt="Diet Plan Preview"
          />

          <button
            type="button"
            className="remove-image"
            onClick={removeImage}
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>

    <div className="status-section">
      <label className="bottom-field-label">
        Status
      </label>

      <div className="status-options">
        {/* ACTIVE */}
        <button
          type="button"
          className={`status-option ${
            isActive ? "active" : ""
          }`}
          onClick={() => setIsActive(true)}
        >
          <span
            className={`status-toggle ${
              isActive ? "toggle-on" : "toggle-off"
            }`}
          >
            <span />
          </span>

          <span>Active</span>
        </button>

      
        <button
          type="button"
          className={`status-option ${
            !isActive ? "active" : ""
          }`}
          onClick={() => setIsActive(false)}
        >
          <span
            className={`status-toggle ${
              !isActive ? "toggle-on" : "toggle-off"
            }`}
          >
            <span />
          </span>

          <span>Inactive</span>
        </button>
      </div>
    </div>
  </div>
</section>
<div className="form-actions">
  <button
    type="button"
    className="cancel-btn"
    onClick={() => {
      setFormData(initialForm);
      setSelectedDiseases([]);
      setDietImage(null);
      setImagePreview(null);
      setDays([1]);
      setDayMeals({
        1: createMealsForDay(1),
      });
      setIsActive(true);
    }}
    disabled={isSubmitting}
  >
    Cancel
  </button>

  <button
    type="button"
    className="submit-diet-btn"
    onClick={addDietPlan}
    disabled={isSubmitting}
  >
    {isSubmitting ? "Creating..." : "Create Diet Plan"}
  </button>
</div>

    </div>
  );
}



function SectionTitle({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className="section-title">

      {icon}

      <div>

        <strong>
          {title}
        </strong>

        {subtitle && (
          <small>
            {subtitle}
          </small>
        )}

      </div>

    </div>
  );
}



function MealCard({
  meal,
  onRemove,
  dayNumber,
  onAddDietItem,
  onRemoveDietItem,
  onUpdateDietItem,
  onUpdateMealField,
  onMealGalleryChange,
  onRemoveMealGalleryImage,
  onUpdateMealGalleryCaption,
}) {
  const Icon = meal.icon;

  return (
    <article
      className={`meal-card ${meal.tone}`}
    >
     

      <div className="meal-card-header">
        <div className="meal-type">
          <Icon size={22} />

          <strong>{meal.name}</strong>
        </div>

        <button
          className="delete-meal"
          type="button"
          aria-label={`Delete ${meal.name}`}
          onClick={onRemove}
        >
          <Trash2 size={15} />
        </button>
      </div>

    

      <div className="diet-items-section">
        <div className="field-section-header">
          <div>
            <label className="section-label">
              Diet / Food Items <em>*</em>
            </label>

            <small>
              Add food items, quantity and notes
            </small>
          </div>
        </div>

        <div className="diet-items-list">
          {(meal.diet || []).map((item, index) => (
            <div
              className="diet-item-row"
              key={item.id}
            >
              <div className="diet-item-number">
                {index + 1}
              </div>

              <div className="diet-item-fields">
                <label>
                  Food Item

                  <input
                    type="text"
                    placeholder="e.g. Warm saffron-almond milk"
                    value={item.name}
                    onChange={(e) =>
                      onUpdateDietItem(
                        dayNumber,
                        meal.id,
                        item.id,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Quantity

                  <input
                    type="text"
                    placeholder="e.g. 1 cup (200 ml)"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateDietItem(
                        dayNumber,
                        meal.id,
                        item.id,
                        "quantity",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label className="diet-item-notes">
                  Notes

                  <input
                    type="text"
                    placeholder="e.g. Easy to digest"
                    value={item.notes}
                    onChange={(e) =>
                      onUpdateDietItem(
                        dayNumber,
                        meal.id,
                        item.id,
                        "notes",
                        e.target.value
                      )
                    }
                  />
                </label>
              </div>

              {(meal.diet || []).length > 1 && (
                <button
                  type="button"
                  className="remove-diet-item"
                  onClick={() =>
                    onRemoveDietItem(
                      dayNumber,
                      meal.id,
                      item.id
                    )
                  }
                  title="Remove item"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          className="add-diet-item-btn"
          onClick={() =>
            onAddDietItem(dayNumber, meal.id)
          }
        >
          <Plus size={15} />
          Add Item
        </button>
      </div>

      <label className="preparation-field">
        Preparation Steps

        <textarea
          placeholder="Enter preparation instructions..."
          value={meal.steps}
          onChange={(e) =>
            onUpdateMealField(
              dayNumber,
              meal.id,
              "steps",
              e.target.value
            )
          }
        />
      </label>

<div className="meal-gallery-section">

  <div className="meal-gallery-header">
    <div>
      <strong>Meal Gallery</strong>
      <small>
        Add images for this meal
      </small>
    </div>

    <label className="meal-gallery-upload">
      <UploadCloud size={14} />
      Add Image

      <input
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            onMealGalleryChange(
              dayNumber,
              meal.id,
              file
            );
          }

          e.target.value = "";
        }}
      />
    </label>
  </div>

  {(meal.diet_gallery || []).length > 0 && (
    <div className="meal-gallery-list">

      {(meal.diet_gallery || []).map(
        (image, index) => (
          <div
            className="meal-gallery-item"
            key={`${meal.id}-gallery-${index}`}
          >

            <div className="meal-gallery-preview">

              <img
                src={image.image_url}
                alt={`${meal.name} ${index + 1}`}
              />

              <button
                type="button"
                className="meal-gallery-remove"
                onClick={() =>
                  onRemoveMealGalleryImage(
                    dayNumber,
                    meal.id,
                    index
                  )
                }
              >
                <X size={13} />
              </button>

            </div>

            <input
              type="text"
              placeholder="Image caption"
              value={image.caption || ""}
              onChange={(e) =>
                onUpdateMealGalleryCaption(
                  dayNumber,
                  meal.id,
                  index,
                  e.target.value
                )
              }
            />

          </div>
        )
      )}

    </div>
  )}


  {(meal.diet_gallery || []).length === 0 && (
    <div className="meal-gallery-empty">
      No meal image added
    </div>
  )}


</div>
    

    <div className="nutrition">
  <span>Nutrition Information</span>

  <div className="nutrition-fields">
    <label>
      Calories (kcal)
      <input
        type="number"
        placeholder="0"
        value={meal.calories}
        onChange={(e) =>
          onUpdateMealField(
            dayNumber,
            meal.id,
            "calories",
            e.target.value
          )
        }
      />
    </label>

    <label>
      Carbs (g)
      <input
        type="number"
        placeholder="0"
        value={meal.carbs}
        onChange={(e) =>
          onUpdateMealField(
            dayNumber,
            meal.id,
            "carbs",
            e.target.value
          )
        }
      />
    </label>

    <label>
      Protein (g)
      <input
        type="number"
        placeholder="0"
        value={meal.protein}
        onChange={(e) =>
          onUpdateMealField(
            dayNumber,
            meal.id,
            "protein",
            e.target.value
          )
        }
      />
    </label>

    <label>
      Fat (g)
      <input
        type="number"
        placeholder="0"
        value={meal.fat}
        onChange={(e) =>
          onUpdateMealField(
            dayNumber,
            meal.id,
            "fat",
            e.target.value
          )
        }
      />
    </label>

<div className="recipe-links-field">
  <label htmlFor={`recipe-${meal.id}`}>
    Recipe Links
  </label>

  <textarea
    id={`recipe-${meal.id}`}
    placeholder={`Enter recipe links
https://youtube.com/recipe-1
https://youtube.com/recipe-2`}
    value={(meal.recipe || []).join("\n")}
    onChange={(e) => {
      const recipes = e.target.value
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url !== "");

      onUpdateMealField(
        dayNumber,
        meal.id,
        "recipe",
        recipes
      );
    }}
  />
</div>
  </div>
</div>
     

    </article>
  );
}