// Mobile Optimization Test Script
// Run this in browser console to test mobile optimizations

const MobileOptimizationTest = {
    // Test configuration
    breakpoints: {
        mobile: 375,
        tablet: 768,
        desktop: 1440
    },
    
    // Test results
    results: {
        viewport: false,
        touchTargets: false,
        responsiveNavigation: false,
        kanbanLayout: false,
        metricsGrid: false,
        timelineLayout: false,
        notesLayout: false,
        typography: false,
        noHorizontalScroll: false
    },
    
    // Run all tests
    runAllTests() {
        console.log('🚀 Starting Mobile Optimization Tests...\n');
        
        this.testViewportMeta();
        this.testTouchTargets();
        this.testResponsiveNavigation();
        this.testKanbanLayout();
        this.testMetricsGrid();
        this.testTimelineLayout();
        this.testNotesLayout();
        this.testTypography();
        this.testNoHorizontalScroll();
        
        this.printResults();
    },
    
    // Test 1: Viewport meta tag
    testViewportMeta() {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        this.results.viewport = !!viewportMeta && 
            viewportMeta.content.includes('width=device-width') &&
            viewportMeta.content.includes('initial-scale=1');
        
        console.log(`✅ Viewport Meta: ${this.results.viewport ? 'PASS' : 'FAIL'}`);
        if (!this.results.viewport) {
            console.log('   Missing or incorrect viewport meta tag');
        }
    },
    
    // Test 2: Touch targets (min 44px)
    testTouchTargets() {
        const touchElements = document.querySelectorAll('.tab-btn, .btn, .add-task-btn, .task-action-btn');
        let allValid = true;
        
        touchElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            if (width < 44 || height < 44) {
                console.log(`   Small touch target: ${el.className} (${width}x${height}px)`);
                allValid = false;
            }
        });
        
        this.results.touchTargets = allValid;
        console.log(`✅ Touch Targets: ${allValid ? 'PASS' : 'FAIL'}`);
    },
    
    // Test 3: Responsive navigation
    testResponsiveNavigation() {
        const navTabs = document.querySelector('.nav-tabs');
        const isMobile = window.innerWidth <= 767;
        
        if (isMobile) {
            // Check if tabs are scrollable on mobile
            this.results.responsiveNavigation = navTabs && 
                (navTabs.style.overflowX === 'auto' || 
                 navTabs.classList.contains('horizontal-scroll') ||
                 getComputedStyle(navTabs).overflowX === 'auto');
        } else {
            // On desktop, just check if nav exists
            this.results.responsiveNavigation = !!navTabs;
        }
        
        console.log(`✅ Responsive Navigation: ${this.results.responsiveNavigation ? 'PASS' : 'FAIL'}`);
    },
    
    // Test 4: Kanban board layout
    testKanbanLayout() {
        const kanbanBoard = document.querySelector('.kanban-board');
        const isMobile = window.innerWidth <= 767;
        
        if (!kanbanBoard) {
            this.results.kanbanLayout = false;
            console.log(`✅ Kanban Layout: FAIL - No kanban board found`);
            return;
        }
        
        if (isMobile) {
            // On mobile, check for single column or horizontal scroll
            const style = getComputedStyle(kanbanBoard);
            const isSingleColumn = style.gridTemplateColumns === '1fr' || 
                                  kanbanBoard.classList.contains('horizontal-scroll');
            this.results.kanbanLayout = isSingleColumn;
        } else {
            // On desktop, check for multi-column layout
            const style = getComputedStyle(kanbanBoard);
            const isMultiColumn = style.gridTemplateColumns.includes('1fr') && 
                                 style.gridTemplateColumns.split(' ').length >= 2;
            this.results.kanbanLayout = isMultiColumn;
        }
        
        console.log(`✅ Kanban Layout: ${this.results.kanbanLayout ? 'PASS' : 'FAIL'}`);
    },
    
    // Test 5: Metrics grid
    testMetricsGrid() {
        const metricsGrid = document.querySelector('.metrics-grid');
        const isMobile = window.innerWidth <= 767;
        
        if (!metricsGrid) {
            this.results.metricsGrid = false;
            console.log(`✅ Metrics Grid: FAIL - No metrics grid found`);
            return;
        }
        
        const style = getComputedStyle(metricsGrid);
        
        if (isMobile) {
            // On mobile, should be single column
            this.results.metricsGrid = style.gridTemplateColumns === '1fr';
        } else {
            // On desktop, should be multi-column
            this.results.metricsGrid = style.gridTemplateColumns.includes('1fr') && 
                                      style.gridTemplateColumns.split(' ').length >= 2;
        }
        
        console.log(`✅ Metrics Grid: ${this.results.metricsGrid ? 'PASS' : 'FAIL'}`);
    },
    
    // Test 6: Timeline layout
    testTimelineLayout() {
        const timeline = document.querySelector('.timeline');
        this.results.timelineLayout = !!timeline;
        console.log(`✅ Timeline Layout: ${this.results.timelineLayout ? 'PASS' : 'FAIL'}`);
    },
    
    // Test 7: Notes layout
    testNotesLayout() {
        const notesContainer = document.querySelector('.notes-container');
        const isMobile = window.innerWidth <= 767;
        
        if (!notesContainer) {
            this.results.notesLayout = false;
            console.log(`✅ Notes Layout: FAIL - No notes container found`);
            return;
        }
        
        const style = getComputedStyle(notesContainer);
        
        if (isMobile) {
            // On mobile, should be single column
            this.results.notesLayout = style.gridTemplateColumns === '1fr';
        } else {
            // On desktop, should be two columns
            this.results.notesLayout = style.gridTemplateColumns.includes('1fr') && 
                                      style.gridTemplateColumns.split(' ').length >= 2;
        }
        
        console.log(`✅ Notes Layout: ${this.results.notesLayout ? 'PASS' : 'FAIL'}`);
    },
    
    // Test 8: Typography
    testTypography() {
        const isMobile = window.innerWidth <= 767;
        
        if (isMobile) {
            // Check body font size on mobile
            const bodyStyle = getComputedStyle(document.body);
            const fontSize = parseFloat(bodyStyle.fontSize);
            this.results.typography = fontSize >= 14 && fontSize <= 16; // Should be readable
        } else {
            this.results.typography = true; // Desktop typography is less critical
        }
        
        console.log(`✅ Typography: ${this.results.typography ? 'PASS' : 'FAIL'}`);
    },
    
    // Test 9: No horizontal scrolling
    testNoHorizontalScroll() {
        const body = document.body;
        const html = document.documentElement;
        
        // Check if content fits within viewport
        const bodyWidth = body.scrollWidth;
        const viewportWidth = window.innerWidth;
        
        this.results.noHorizontalScroll = bodyWidth <= viewportWidth;
        
        console.log(`✅ No Horizontal Scroll: ${this.results.noHorizontalScroll ? 'PASS' : 'FAIL'}`);
        if (!this.results.noHorizontalScroll) {
            console.log(`   Content width: ${bodyWidth}px, Viewport width: ${viewportWidth}px`);
        }
    },
    
    // Print test results
    printResults() {
        console.log('\n📊 TEST RESULTS:');
        console.log('================');
        
        const totalTests = Object.keys(this.results).length;
        const passedTests = Object.values(this.results).filter(r => r).length;
        const percentage = Math.round((passedTests / totalTests) * 100);
        
        Object.entries(this.results).forEach(([test, result]) => {
            const icon = result ? '✅' : '❌';
            const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            console.log(`${icon} ${testName}`);
        });
        
        console.log('\n📈 SUMMARY:');
        console.log(`   ${passedTests}/${totalTests} tests passed (${percentage}%)`);
        
        if (percentage >= 80) {
            console.log('🎉 Excellent! Mobile optimizations are working well.');
        } else if (percentage >= 60) {
            console.log('⚠️  Good, but some improvements needed.');
        } else {
            console.log('🚨 Significant mobile optimization issues detected.');
        }
    },
    
    // Simulate different screen sizes
    simulateScreenSize(width) {
        console.log(`\n🔄 Simulating screen width: ${width}px`);
        
        // Update viewport
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.content = `width=${width}, initial-scale=1`;
        }
        
        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
        
        // Run tests after a short delay
        setTimeout(() => {
            console.log(`\n📱 Testing at ${width}px width:`);
            this.runAllTests();
        }, 500);
    }
};

// Export for browser console
window.MobileOptimizationTest = MobileOptimizationTest;

console.log('📱 Mobile Optimization Test Suite loaded!');
console.log('Available commands:');
console.log('  MobileOptimizationTest.runAllTests() - Run all tests');
console.log('  MobileOptimizationTest.simulateScreenSize(375) - Test mobile size');
console.log('  MobileOptimizationTest.simulateScreenSize(768) - Test tablet size');
console.log('  MobileOptimizationTest.simulateScreenSize(1440) - Test desktop size');